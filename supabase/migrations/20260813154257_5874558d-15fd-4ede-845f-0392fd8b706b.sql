-- 1. Create Departments and Membership tables
CREATE TABLE IF NOT EXISTS public.whatsapp_departments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
    name text NOT NULL,
    description text,
    status text DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.whatsapp_department_members (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    department_id uuid REFERENCES public.whatsapp_departments(id) ON DELETE CASCADE NOT NULL,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at timestamptz DEFAULT now(),
    UNIQUE(department_id, user_id)
);

-- 2. Create Attendance Transfers log table
CREATE TABLE IF NOT EXISTS public.attendance_transfers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
    attendance_id uuid REFERENCES public.whatsapp_attendances(id) ON DELETE CASCADE NOT NULL,
    previous_department_id uuid REFERENCES public.whatsapp_departments(id),
    new_department_id uuid REFERENCES public.whatsapp_departments(id) NOT NULL,
    previous_agent_id uuid REFERENCES auth.users(id),
    new_agent_id uuid REFERENCES auth.users(id),
    reason text NOT NULL,
    transferred_by uuid REFERENCES auth.users(id) NOT NULL,
    message_sent_to_client boolean DEFAULT false,
    client_message_status text DEFAULT 'not_sent', 
    created_at timestamptz DEFAULT now()
);

-- 3. Add department_id to attendances if not exists
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'whatsapp_attendances' AND column_name = 'department_id') THEN
        ALTER TABLE public.whatsapp_attendances ADD COLUMN department_id uuid REFERENCES public.whatsapp_departments(id);
    END IF;
END $$;

-- 4. Enable RLS and Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.whatsapp_departments TO authenticated;
GRANT ALL ON public.whatsapp_departments TO service_role;
ALTER TABLE public.whatsapp_departments ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.whatsapp_department_members TO authenticated;
GRANT ALL ON public.whatsapp_department_members TO service_role;
ALTER TABLE public.whatsapp_department_members ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.attendance_transfers TO authenticated;
GRANT ALL ON public.attendance_transfers TO service_role;
ALTER TABLE public.attendance_transfers ENABLE ROW LEVEL SECURITY;

-- 5. Atomic Transfer RPC
CREATE OR REPLACE FUNCTION public.transfer_attendance(
    p_attendance_id uuid,
    p_new_department_id uuid,
    p_new_agent_id uuid DEFAULT NULL,
    p_reason text DEFAULT '',
    p_client_message text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    v_attendance record;
    v_user_id uuid := auth.uid();
    v_tenant_id uuid;
    v_previous_department_id uuid;
    v_previous_agent_id uuid;
    v_transfer_id uuid;
BEGIN
    -- 1. Get current attendance info
    SELECT * INTO v_attendance 
    FROM public.whatsapp_attendances 
    WHERE id = p_attendance_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Atendimento não encontrado';
    END IF;

    IF v_attendance.status = 'finalized' THEN
        RAISE EXCEPTION 'Não é possível transferir um atendimento finalizado';
    END IF;

    v_tenant_id := v_attendance.tenant_id;
    v_previous_department_id := v_attendance.department_id;
    v_previous_agent_id := v_attendance.assigned_user_id;

    -- 2. Validate destination department exists in same tenant
    IF NOT EXISTS (SELECT 1 FROM public.whatsapp_departments WHERE id = p_new_department_id AND tenant_id = v_tenant_id AND status = 'active') THEN
        RAISE EXCEPTION 'Departamento de destino inválido ou inativo';
    END IF;

    -- 3. Validate new agent if provided
    IF p_new_agent_id IS NOT NULL THEN
        IF NOT EXISTS (SELECT 1 FROM public.whatsapp_department_members WHERE department_id = p_new_department_id AND user_id = p_new_agent_id) THEN
            RAISE EXCEPTION 'O atendente selecionado não pertence ao departamento de destino';
        END IF;
    END IF;

    -- 4. Insert transfer log
    INSERT INTO public.attendance_transfers (
        tenant_id,
        attendance_id,
        previous_department_id,
        new_department_id,
        previous_agent_id,
        new_agent_id,
        reason,
        transferred_by,
        message_sent_to_client
    ) VALUES (
        v_tenant_id,
        p_attendance_id,
        v_previous_department_id,
        p_new_department_id,
        v_previous_agent_id,
        p_new_agent_id,
        p_reason,
        v_user_id,
        (p_client_message IS NOT NULL AND p_client_message <> '')
    ) RETURNING id INTO v_transfer_id;

    -- 5. Update attendance
    UPDATE public.whatsapp_attendances
    SET 
        department_id = p_new_department_id,
        assigned_user_id = p_new_agent_id,
        status = CASE WHEN p_new_agent_id IS NULL THEN 'waiting' ELSE 'active' END,
        updated_at = now()
    WHERE id = p_attendance_id;

    -- 6. Insert Timeline Event
    INSERT INTO public.attendance_events (
        tenant_id,
        attendance_id,
        event_type,
        previous_value,
        new_value,
        description,
        created_by
    ) VALUES (
        v_tenant_id,
        p_attendance_id,
        'attendance_transferred',
        jsonb_build_object('dept', v_previous_department_id, 'agent', v_previous_agent_id)::text,
        jsonb_build_object('dept', p_new_department_id, 'agent', p_new_agent_id)::text,
        format('Atendimento transferido. Motivo: %s', p_reason),
        v_user_id
    );

    RETURN json_build_object(
        'success', true, 
        'transfer_id', v_transfer_id,
        'new_status', CASE WHEN p_new_agent_id IS NULL THEN 'waiting' ELSE 'active' END
    );
END;
$$;

-- 6. Basic RLS Policies
CREATE POLICY "Users can see departments of their tenant" ON public.whatsapp_departments
    FOR SELECT TO authenticated USING (tenant_id IN (SELECT tenant_id FROM public.tenant_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can see department members of their tenant" ON public.whatsapp_department_members
    FOR SELECT TO authenticated USING (department_id IN (SELECT id FROM public.whatsapp_departments WHERE tenant_id IN (SELECT tenant_id FROM public.tenant_members WHERE user_id = auth.uid())));

CREATE POLICY "Users can see transfers of their tenant" ON public.attendance_transfers
    FOR SELECT TO authenticated USING (tenant_id IN (SELECT tenant_id FROM public.tenant_members WHERE user_id = auth.uid()));
