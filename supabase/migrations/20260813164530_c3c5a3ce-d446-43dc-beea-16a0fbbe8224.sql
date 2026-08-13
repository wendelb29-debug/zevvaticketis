-- 1) ticket_types: public read only for published events
DROP POLICY IF EXISTS "Public read for ticket_types" ON public.ticket_types;

CREATE POLICY "Public read published ticket_types"
ON public.ticket_types
FOR SELECT
TO anon, authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.events e
    WHERE e.id = ticket_types.event_id
      AND e.status = 'publicado'
  )
);

-- 2) transfer_attendance: enforce caller authorization inside the SECURITY DEFINER function
CREATE OR REPLACE FUNCTION public.transfer_attendance(p_attendance_id uuid, p_new_department_id uuid, p_new_agent_id uuid DEFAULT NULL::uuid, p_reason text DEFAULT ''::text, p_client_message text DEFAULT NULL::text)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'auth'
AS $function$
DECLARE
    v_attendance record;
    v_user_id uuid := auth.uid();
    v_tenant_id uuid;
    v_previous_department_id uuid;
    v_previous_agent_id uuid;
    v_transfer_id uuid;
BEGIN
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Não autenticado';
    END IF;

    SELECT * INTO v_attendance
    FROM public.whatsapp_attendances
    WHERE id = p_attendance_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Atendimento não encontrado';
    END IF;

    v_tenant_id := v_attendance.tenant_id;

    -- AUTHORIZATION: caller must belong to the attendance tenant (or be platform admin)
    IF NOT EXISTS (
        SELECT 1 FROM public.tenant_members tm
        WHERE tm.tenant_id = v_tenant_id AND tm.user_id = v_user_id
    ) AND NOT EXISTS (
        SELECT 1 FROM public.platform_admins pa WHERE pa.user_id = v_user_id
    ) THEN
        RAISE EXCEPTION 'Acesso negado: você não pertence a este ambiente';
    END IF;

    IF v_attendance.status = 'finalized' THEN
        RAISE EXCEPTION 'Não é possível transferir um atendimento finalizado';
    END IF;

    v_previous_department_id := v_attendance.department_id;
    v_previous_agent_id := v_attendance.assigned_user_id;

    IF NOT EXISTS (SELECT 1 FROM public.whatsapp_departments WHERE id = p_new_department_id AND tenant_id = v_tenant_id AND status = 'active') THEN
        RAISE EXCEPTION 'Departamento de destino inválido ou inativo';
    END IF;

    IF p_new_agent_id IS NOT NULL THEN
        IF NOT EXISTS (SELECT 1 FROM public.whatsapp_department_members WHERE department_id = p_new_department_id AND user_id = p_new_agent_id) THEN
            RAISE EXCEPTION 'O atendente selecionado não pertence ao departamento de destino';
        END IF;
    END IF;

    INSERT INTO public.attendance_transfers (
        tenant_id, attendance_id, previous_department_id, new_department_id,
        previous_agent_id, new_agent_id, reason, transferred_by, message_sent_to_client
    ) VALUES (
        v_tenant_id, p_attendance_id, v_previous_department_id, p_new_department_id,
        v_previous_agent_id, p_new_agent_id, p_reason, v_user_id,
        (p_client_message IS NOT NULL AND p_client_message <> '')
    ) RETURNING id INTO v_transfer_id;

    UPDATE public.whatsapp_attendances
    SET department_id = p_new_department_id,
        assigned_user_id = p_new_agent_id,
        status = CASE WHEN p_new_agent_id IS NULL THEN 'waiting' ELSE 'active' END,
        updated_at = now()
    WHERE id = p_attendance_id;

    INSERT INTO public.attendance_events (
        tenant_id, attendance_id, event_type, previous_value, new_value, description, created_by
    ) VALUES (
        v_tenant_id, p_attendance_id, 'attendance_transferred',
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
$function$;