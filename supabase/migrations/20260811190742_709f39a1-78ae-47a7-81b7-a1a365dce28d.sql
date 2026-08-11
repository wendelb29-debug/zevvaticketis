-- Drop dependent policies first
DROP POLICY IF EXISTS "Owners can manage invites" ON public.team_invites;
DROP POLICY IF EXISTS "Owners can update their organizations" ON public.organizations;
DROP POLICY IF EXISTS "Owners can read ledger" ON public.ledger_entries;
DROP POLICY IF EXISTS "Admins and Owners can manage event staff" ON public.event_staff;

-- Create tenant_role enum
DO $$ BEGIN
    CREATE TYPE public.tenant_role AS ENUM (
        'OWNER', 
        'ADMIN', 
        'MANAGER', 
        'CHECKIN_SUPERVISOR', 
        'CHECKIN_OPERATOR', 
        'FINANCEIRO', 
        'MARKETING'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Rename organizations to tenants if it exists
DO $$ BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'organizations') THEN
        ALTER TABLE public.organizations RENAME TO tenants;
    END IF;
END $$;

-- Rename organization_members to tenant_members if it exists
DO $$ BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'organization_members') THEN
        ALTER TABLE public.organization_members RENAME TO tenant_members;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tenant_members' AND column_name = 'organization_id') THEN
            ALTER TABLE public.tenant_members RENAME COLUMN organization_id TO tenant_id;
        END IF;
    END IF;
END $$;

-- Add new columns to tenants
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS logo text;
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS slug text;
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS plan text DEFAULT 'Free';

-- Add tenant_role column to tenant_members
ALTER TABLE public.tenant_members ADD COLUMN IF NOT EXISTS new_role public.tenant_role;

-- Migrate existing roles if any
UPDATE public.tenant_members SET new_role = 'OWNER' WHERE role = 'produtor_owner' AND new_role IS NULL;
UPDATE public.tenant_members SET new_role = 'ADMIN' WHERE role = 'equipe' AND new_role IS NULL;
UPDATE public.tenant_members SET new_role = 'OWNER' WHERE new_role IS NULL;

-- Make role mandatory and drop old
ALTER TABLE public.tenant_members ALTER COLUMN new_role SET NOT NULL;
ALTER TABLE public.tenant_members DROP COLUMN IF EXISTS role;
ALTER TABLE public.tenant_members RENAME COLUMN new_role TO role;

-- Update business tables to have tenant_id
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.tenants(id);
ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.tenants(id);
ALTER TABLE public.checkin_records ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.tenants(id);
ALTER TABLE public.email_logs ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.tenants(id);
ALTER TABLE public.email_templates ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.tenants(id);
ALTER TABLE public.ads ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.tenants(id);

-- Fix Campaigns rename
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'campaigns' AND column_name = 'organization_id') THEN
        ALTER TABLE public.campaigns RENAME COLUMN organization_id TO tenant_id;
    END IF;
END $$;

-- Populate slug for existing tenants
UPDATE public.tenants SET slug = lower(regexp_replace(nome, '[^a-zA-Z0-9]', '-', 'g')) || '-' || substr(id::text, 1, 4) WHERE slug IS NULL;
ALTER TABLE public.tenants ALTER COLUMN slug SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS tenants_slug_idx ON public.tenants(slug);

-- RLS Helper Functions
CREATE OR REPLACE FUNCTION public.get_user_tenants()
RETURNS TABLE (tenant_id uuid) AS $$
  SELECT tm.tenant_id FROM public.tenant_members tm WHERE tm.user_id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_platform_admin()
RETURNS boolean AS $$
  SELECT EXISTS (SELECT 1 FROM public.platform_admins WHERE user_id = auth.uid());
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tenants TO authenticated;
GRANT ALL ON public.tenants TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tenant_members TO authenticated;
GRANT ALL ON public.tenant_members TO service_role;

-- Standardize RLS Policies
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Members can read their tenants" ON public.tenants;
CREATE POLICY "Members can read their tenants" ON public.tenants
FOR SELECT TO authenticated
USING (id IN (SELECT public.get_user_tenants()) OR public.is_platform_admin());

-- Recreate Owners policy for tenants
CREATE POLICY "Owners can update their tenants" ON public.tenants
FOR UPDATE TO authenticated
USING (EXISTS (
    SELECT 1 FROM public.tenant_members 
    WHERE tenant_id = public.tenants.id AND user_id = auth.uid() AND role = 'OWNER'
) OR public.is_platform_admin());

ALTER TABLE public.tenant_members ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Members can see other members" ON public.tenant_members;
CREATE POLICY "Members can see other members" ON public.tenant_members
FOR SELECT TO authenticated
USING (tenant_id IN (SELECT public.get_user_tenants()) OR public.is_platform_admin());

-- Recreate dependent policies
CREATE POLICY "Owners can manage invites" ON public.team_invites
FOR ALL TO authenticated
USING (EXISTS (
    SELECT 1 FROM public.tenant_members 
    WHERE tenant_id = public.team_invites.organization_id AND user_id = auth.uid() AND role = 'OWNER'
) OR public.is_platform_admin());

-- Business Data Isolation
DO $$ 
DECLARE 
    t text;
BEGIN
    FOR t IN SELECT table_name FROM information_schema.columns WHERE column_name = 'tenant_id' AND table_schema = 'public'
    LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
        EXECUTE format('DROP POLICY IF EXISTS "Tenant isolation" ON public.%I', t);
        EXECUTE format('CREATE POLICY "Tenant isolation" ON public.%I FOR ALL TO authenticated USING (tenant_id IN (SELECT public.get_user_tenants()) OR public.is_platform_admin())', t);
    END LOOP;
END $$;
