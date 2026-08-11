-- Fix RPC security: Revoke public access from security definer functions
REVOKE EXECUTE ON FUNCTION public.get_user_tenants() FROM public;
GRANT EXECUTE ON FUNCTION public.get_user_tenants() TO authenticated;

REVOKE EXECUTE ON FUNCTION public.is_platform_admin() FROM public;
GRANT EXECUTE ON FUNCTION public.is_platform_admin() TO authenticated;

-- Clean up columns
DO $$ 
DECLARE 
    t text;
BEGIN
    FOR t IN SELECT table_name FROM information_schema.columns WHERE column_name = 'organization_id' AND table_schema = 'public'
    LOOP
        -- If tenant_id doesn't exist, just rename organization_id
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = t AND column_name = 'tenant_id' AND table_schema = 'public') THEN
            EXECUTE format('ALTER TABLE public.%I RENAME COLUMN organization_id TO tenant_id', t);
        ELSE
            -- If both exist, move data from organization_id to tenant_id if tenant_id is null, then drop organization_id
            EXECUTE format('UPDATE public.%I SET tenant_id = organization_id WHERE tenant_id IS NULL', t);
            EXECUTE format('ALTER TABLE public.%I DROP COLUMN organization_id CASCADE', t);
        END IF;
    END LOOP;
END $$;

-- Re-apply Business Data Isolation Policies
DO $$ 
DECLARE 
    t text;
BEGIN
    FOR t IN SELECT table_name FROM information_schema.columns WHERE column_name = 'tenant_id' AND table_schema = 'public'
    LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
        EXECUTE format('DROP POLICY IF EXISTS "Tenant isolation" ON public.%I', t);
        EXECUTE format('CREATE POLICY "Tenant isolation" ON public.%I FOR ALL TO authenticated USING (tenant_id IN (SELECT tenant_id FROM public.tenant_members WHERE user_id = auth.uid()) OR (SELECT EXISTS (SELECT 1 FROM public.platform_admins WHERE user_id = auth.uid())))', t);
    END LOOP;
END $$;

-- Ensure tenants table is also secured
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Members can read their tenants" ON public.tenants;
CREATE POLICY "Members can read their tenants" ON public.tenants
FOR SELECT TO authenticated
USING (id IN (SELECT tenant_id FROM public.tenant_members WHERE user_id = auth.uid()) OR (SELECT EXISTS (SELECT 1 FROM public.platform_admins WHERE user_id = auth.uid())));
