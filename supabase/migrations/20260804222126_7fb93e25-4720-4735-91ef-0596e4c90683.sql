ALTER TABLE public.organizations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members DISABLE ROW LEVEL SECURITY;
GRANT ALL ON TABLE public.organizations TO authenticated, anon, service_role;
GRANT ALL ON TABLE public.organization_members TO authenticated, anon, service_role;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;

-- Simple permissive policies for registration
DROP POLICY IF EXISTS "Allow anon to insert organization during signup" ON public.organizations;
CREATE POLICY "Allow anon to insert organization during signup" ON public.organizations FOR INSERT TO anon WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon to insert member during signup" ON public.organization_members;
CREATE POLICY "Allow anon to insert member during signup" ON public.organization_members FOR INSERT TO anon WITH CHECK (true);
