-- 1. Normalização de Telefones (Função Auxiliar)
CREATE OR REPLACE FUNCTION public.normalize_phone(p_phone text)
RETURNS text
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_normalized text;
BEGIN
    -- Remove tudo que não for dígito
    v_normalized := regexp_replace(p_phone, '\D', '', 'g');
    
    -- Se começar com 00, remove
    IF v_normalized LIKE '00%' THEN
        v_normalized := substr(v_normalized, 3);
    END IF;
    
    -- Se não tiver código de país e parecer um número brasileiro (11 dígitos)
    -- O sistema deve preferir que o código do país seja enviado, mas aqui normalizamos o básico
    RETURN v_normalized;
END;
$$;

-- 2. Atualização da tabela whatsapp_contacts
ALTER TABLE public.whatsapp_contacts 
ADD COLUMN IF NOT EXISTS normalized_phone text,
ADD COLUMN IF NOT EXISTS email text,
ADD COLUMN IF NOT EXISTS document text,
ADD COLUMN IF NOT EXISTS avatar_url text,
ADD COLUMN IF NOT EXISTS channel text DEFAULT 'whatsapp',
ADD COLUMN IF NOT EXISTS external_contact_id text,
ADD COLUMN IF NOT EXISTS notes text,
ADD COLUMN IF NOT EXISTS status text DEFAULT 'active' CHECK (status IN ('active', 'blocked', 'archived')),
ADD COLUMN IF NOT EXISTS first_contact_at timestamptz DEFAULT now(),
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now(),
ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id);

-- Popular normalized_phone para registros existentes
UPDATE public.whatsapp_contacts 
SET normalized_phone = public.normalize_phone(phone)
WHERE normalized_phone IS NULL;

-- Adicionar restrição de unicidade por tenant + telefone normalizado
-- Primeiro removemos duplicatas se existirem (mantendo o mais recente)
DO $$
BEGIN
    DELETE FROM public.whatsapp_contacts a
    USING public.whatsapp_contacts b
    WHERE a.id < b.id 
      AND a.tenant_id = b.tenant_id 
      AND public.normalize_phone(a.phone) = public.normalize_phone(b.phone);
EXCEPTION WHEN OTHERS THEN
    -- Ignorar se houver erro ao deletar
END $$;

ALTER TABLE public.whatsapp_contacts 
DROP CONSTRAINT IF EXISTS whatsapp_contacts_phone_key;

-- Se houver erro aqui, pode ser por duplicatas residuais
CREATE UNIQUE INDEX IF NOT EXISTS idx_contacts_tenant_phone ON public.whatsapp_contacts (tenant_id, normalized_phone);

-- 3. Atualização da tabela whatsapp_contact_groups
ALTER TABLE public.whatsapp_contact_groups
ADD COLUMN IF NOT EXISTS status text DEFAULT 'active' CHECK (status IN ('active', 'archived')),
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now(),
ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id);

-- 4. Atualização da tabela whatsapp_contact_group_memberships
ALTER TABLE public.whatsapp_contact_group_memberships
ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.tenants(id),
ADD COLUMN IF NOT EXISTS added_by uuid REFERENCES auth.users(id);

-- Popular tenant_id nas associações existentes baseado no grupo
UPDATE public.whatsapp_contact_group_memberships m
SET tenant_id = g.tenant_id
FROM public.whatsapp_contact_groups g
WHERE m.group_id = g.id AND m.tenant_id IS NULL;

-- 5. Atualização da tabela whatsapp_attendances
-- Remover check constraint antigo se existir
ALTER TABLE public.whatsapp_attendances DROP CONSTRAINT IF EXISTS whatsapp_attendances_status_check;

ALTER TABLE public.whatsapp_attendances
ADD COLUMN IF NOT EXISTS protocol text,
ADD COLUMN IF NOT EXISTS channel text DEFAULT 'whatsapp',
ADD COLUMN IF NOT EXISTS department_id uuid, -- Referência futura
ADD COLUMN IF NOT EXISTS assigned_user_id uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS subject text,
ADD COLUMN IF NOT EXISTS summary text,
ADD COLUMN IF NOT EXISTS started_at timestamptz DEFAULT now(),
ADD COLUMN IF NOT EXISTS first_response_at timestamptz,
ADD COLUMN IF NOT EXISTS finalized_at timestamptz,
ADD COLUMN IF NOT EXISTS finalized_by uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS finalization_reason text,
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Ajustar status para os novos valores
-- Mapeamento: open -> active, closed -> finalized, pending -> waiting
UPDATE public.whatsapp_attendances SET status = 'active' WHERE status = 'open';
UPDATE public.whatsapp_attendances SET status = 'finalized' WHERE status = 'closed';
UPDATE public.whatsapp_attendances SET status = 'waiting' WHERE status = 'pending';

ALTER TABLE public.whatsapp_attendances 
ADD CONSTRAINT whatsapp_attendances_status_check 
CHECK (status IN ('waiting', 'active', 'transferred', 'finalized', 'cancelled'));

-- 6. Nova tabela attendance_events
CREATE TABLE IF NOT EXISTS public.attendance_events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    attendance_id uuid NOT NULL REFERENCES public.whatsapp_attendances(id) ON DELETE CASCADE,
    event_type text NOT NULL,
    previous_value text,
    new_value text,
    description text,
    created_by uuid REFERENCES auth.users(id),
    created_at timestamptz DEFAULT now()
);

-- 7. RLS e Permissões
GRANT SELECT, INSERT, UPDATE, DELETE ON public.attendance_events TO authenticated;
GRANT ALL ON public.attendance_events TO service_role;

ALTER TABLE public.attendance_events ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    CREATE POLICY "Tenant isolation for attendance_events" ON public.attendance_events
    FOR ALL TO authenticated
    USING (tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()));
EXCEPTION WHEN OTHERS THEN
    -- Policy might exist
END $$;

-- Garantir que as outras tabelas tenham RLS correto
ALTER TABLE public.whatsapp_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_contact_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_contact_group_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_attendances ENABLE ROW LEVEL SECURITY;

-- 8. Índices
CREATE INDEX IF NOT EXISTS idx_contacts_name ON public.whatsapp_contacts (name);
CREATE INDEX IF NOT EXISTS idx_contacts_email ON public.whatsapp_contacts (email);
CREATE INDEX IF NOT EXISTS idx_contacts_status ON public.whatsapp_contacts (status);
CREATE INDEX IF NOT EXISTS idx_attendances_protocol ON public.whatsapp_attendances (protocol);
CREATE INDEX IF NOT EXISTS idx_attendances_status ON public.whatsapp_attendances (status);
CREATE INDEX IF NOT EXISTS idx_attendance_events_attendance ON public.attendance_events (attendance_id);
