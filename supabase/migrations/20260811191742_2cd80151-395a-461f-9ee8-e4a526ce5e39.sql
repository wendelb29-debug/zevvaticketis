
-- 1. Ensure tenant_role enum has all required roles
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tenant_role') THEN
        CREATE TYPE tenant_role AS ENUM ('OWNER', 'ADMIN', 'MANAGER', 'MARKETING', 'FINANCEIRO', 'CHECKIN_SUPERVISOR', 'CHECKIN_OPERATOR');
    ELSE
        -- Add missing roles to existing enum if needed
        ALTER TYPE tenant_role ADD VALUE IF NOT EXISTS 'MARKETING';
        ALTER TYPE tenant_role ADD VALUE IF NOT EXISTS 'FINANCEIRO';
        ALTER TYPE tenant_role ADD VALUE IF NOT EXISTS 'CHECKIN_SUPERVISOR';
        ALTER TYPE tenant_role ADD VALUE IF NOT EXISTS 'CHECKIN_OPERATOR';
    END IF;
END $$;

-- 2. Ensure all tables have tenant_id and correctly named
-- (Previous migration renamed organization_id to tenant_id, ensuring here)

DO $$ 
DECLARE 
    tbl RECORD;
BEGIN
    FOR tbl IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('events', 'tickets', 'orders', 'campaigns', 'ads', 'checkin_records', 'email_logs', 'email_templates', 'push_automations')) LOOP
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = tbl.tablename AND column_name = 'tenant_id') THEN
            EXECUTE format('ALTER TABLE public.%I ADD COLUMN tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE', tbl.tablename);
        END IF;
    END LOOP;
END $$;

-- 3. Standardize RLS policies for multi-tenant isolation
-- We use a helper function to get the current user's tenants
CREATE OR REPLACE FUNCTION public.get_user_tenants()
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT tenant_id FROM public.tenant_members WHERE user_id = auth.uid();
$$;

-- Apply to events
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Tenant isolation for events" ON public.events;
CREATE POLICY "Tenant isolation for events" ON public.events
FOR ALL TO authenticated
USING (tenant_id IN (SELECT public.get_user_tenants()) OR public.check_is_platform_admin(auth.uid()));

-- Apply to tickets
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Tenant isolation for tickets" ON public.tickets;
CREATE POLICY "Tenant isolation for tickets" ON public.tickets
FOR ALL TO authenticated
USING (tenant_id IN (SELECT public.get_user_tenants()) OR public.check_is_platform_admin(auth.uid()));

-- Apply to orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Tenant isolation for orders" ON public.orders;
CREATE POLICY "Tenant isolation for orders" ON public.orders
FOR ALL TO authenticated
USING (tenant_id IN (SELECT public.get_user_tenants()) OR public.check_is_platform_admin(auth.uid()));

-- Repeat for other core tables...
DO $$ 
DECLARE 
    tbl RECORD;
BEGIN
    FOR tbl IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('campaigns', 'ads', 'checkin_records', 'email_logs', 'email_templates', 'push_automations')) LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', tbl.tablename);
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', 'Tenant isolation for ' || tbl.tablename, tbl.tablename);
        EXECUTE format('CREATE POLICY %I ON public.%I FOR ALL TO authenticated USING (tenant_id IN (SELECT public.get_user_tenants()) OR public.check_is_platform_admin(auth.uid()))', 'Tenant isolation for ' || tbl.tablename, tbl.tablename);
    END LOOP;
END $$;

-- 4. Admin Master view needs global access
GRANT SELECT ON public.tenants TO authenticated;
GRANT SELECT ON public.tenant_members TO authenticated;
