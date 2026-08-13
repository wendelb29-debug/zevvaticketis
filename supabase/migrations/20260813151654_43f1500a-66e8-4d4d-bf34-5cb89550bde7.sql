
-- FASE 1: Grupos, Arquivos (lógica), Histórico e Agendamento

-- 1. Grupos de Contatos
CREATE TABLE IF NOT EXISTS public.whatsapp_contact_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    color TEXT DEFAULT '#E35B62',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(tenant_id, name)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.whatsapp_contact_groups TO authenticated;
GRANT ALL ON public.whatsapp_contact_groups TO service_role;

ALTER TABLE public.whatsapp_contact_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage groups of their tenant"
    ON public.whatsapp_contact_groups
    FOR ALL
    TO authenticated
    USING (tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()));

-- 2. Membros dos Grupos
CREATE TABLE IF NOT EXISTS public.whatsapp_contact_group_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contact_id UUID REFERENCES public.whatsapp_contacts(id) ON DELETE CASCADE NOT NULL,
    group_id UUID REFERENCES public.whatsapp_contact_groups(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(contact_id, group_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.whatsapp_contact_group_memberships TO authenticated;
GRANT ALL ON public.whatsapp_contact_group_memberships TO service_role;

ALTER TABLE public.whatsapp_contact_group_memberships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage group memberships of their tenant"
    ON public.whatsapp_contact_group_memberships
    FOR ALL
    TO authenticated
    USING (
        contact_id IN (SELECT id FROM whatsapp_contacts WHERE tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()))
    );

-- 3. Atendimentos (Histórico e Estado)
CREATE TABLE IF NOT EXISTS public.whatsapp_attendances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
    contact_id UUID REFERENCES public.whatsapp_contacts(id) ON DELETE CASCADE NOT NULL,
    agent_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    status TEXT NOT NULL CHECK (status IN ('open', 'closed', 'pending', 'transferred')),
    closure_reason TEXT,
    internal_notes TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    closed_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}'::jsonb
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.whatsapp_attendances TO authenticated;
GRANT ALL ON public.whatsapp_attendances TO service_role;

ALTER TABLE public.whatsapp_attendances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage attendances of their tenant"
    ON public.whatsapp_attendances
    FOR ALL
    TO authenticated
    USING (tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()));

-- 4. Agendamentos
CREATE TABLE IF NOT EXISTS public.whatsapp_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
    contact_id UUID REFERENCES public.whatsapp_contacts(id) ON DELETE CASCADE NOT NULL,
    agent_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    message_content TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.whatsapp_schedules TO authenticated;
GRANT ALL ON public.whatsapp_schedules TO service_role;

ALTER TABLE public.whatsapp_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage schedules of their tenant"
    ON public.whatsapp_schedules
    FOR ALL
    TO authenticated
    USING (tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()));

-- Indexing for performance
CREATE INDEX IF NOT EXISTS idx_whatsapp_attendances_contact_id ON public.whatsapp_attendances(contact_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_attendances_tenant_id ON public.whatsapp_attendances(tenant_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_schedules_scheduled_at ON public.whatsapp_schedules(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_media ON public.whatsapp_messages(contact_id) WHERE media_url IS NOT NULL;
