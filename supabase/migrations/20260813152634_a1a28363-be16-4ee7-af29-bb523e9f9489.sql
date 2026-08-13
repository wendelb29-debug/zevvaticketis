-- 1. Corrigir função normalize_phone
ALTER FUNCTION public.normalize_phone(text) SECURITY INVOKER;
REVOKE EXECUTE ON FUNCTION public.normalize_phone(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.normalize_phone(text) TO authenticated, service_role;

-- 2. Garantir políticas RLS para todas as tabelas de CRM
-- whatsapp_contacts
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'whatsapp_contacts' AND policyname = 'Tenant isolation for contacts') THEN
        CREATE POLICY "Tenant isolation for contacts" ON public.whatsapp_contacts
        FOR ALL TO authenticated
        USING (tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()));
    END IF;
END $$;

-- whatsapp_contact_groups
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'whatsapp_contact_groups' AND policyname = 'Tenant isolation for groups') THEN
        CREATE POLICY "Tenant isolation for groups" ON public.whatsapp_contact_groups
        FOR ALL TO authenticated
        USING (tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()));
    END IF;
END $$;

-- whatsapp_contact_group_memberships
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'whatsapp_contact_group_memberships' AND policyname = 'Tenant isolation for group memberships') THEN
        CREATE POLICY "Tenant isolation for group memberships" ON public.whatsapp_contact_group_memberships
        FOR ALL TO authenticated
        USING (tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()));
    END IF;
END $$;

-- whatsapp_attendances
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'whatsapp_attendances' AND policyname = 'Tenant isolation for attendances') THEN
        CREATE POLICY "Tenant isolation for attendances" ON public.whatsapp_attendances
        FOR ALL TO authenticated
        USING (tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()));
    END IF;
END $$;

-- 3. Garantir GRANTs (essencial no Lovable Cloud)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.whatsapp_contacts TO authenticated;
GRANT ALL ON public.whatsapp_contacts TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.whatsapp_contact_groups TO authenticated;
GRANT ALL ON public.whatsapp_contact_groups TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.whatsapp_contact_group_memberships TO authenticated;
GRANT ALL ON public.whatsapp_contact_group_memberships TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.whatsapp_attendances TO authenticated;
GRANT ALL ON public.whatsapp_attendances TO service_role;
