-- 1. Ensure RLS is active on all core tables
ALTER TABLE public.platform_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. Platform Admins: Only self-read, writing via service role
DROP POLICY IF EXISTS "Admins can read own record" ON public.platform_admins;
CREATE POLICY "Admins can read own record" ON public.platform_admins
  FOR SELECT TO authenticated USING (user_id = auth.uid());

-- 3. Organizations: Visible/editable only by members
DROP POLICY IF EXISTS "Members can read their organizations" ON public.organizations;
CREATE POLICY "Members can read their organizations" ON public.organizations
  FOR SELECT TO authenticated 
  USING (EXISTS (
    SELECT 1 FROM public.organization_members 
    WHERE organization_members.organization_id = organizations.id 
    AND organization_members.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Owners can update their organizations" ON public.organizations;
CREATE POLICY "Owners can update their organizations" ON public.organizations
  FOR UPDATE TO authenticated 
  USING (EXISTS (
    SELECT 1 FROM public.organization_members 
    WHERE organization_members.organization_id = organizations.id 
    AND organization_members.user_id = auth.uid()
    AND organization_members.role = 'produtor_owner'
  ));

-- 4. Profiles: Strict self-access
DROP POLICY IF EXISTS "Public can read profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile" ON public.profiles
  FOR SELECT TO authenticated USING (id = auth.uid());

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (id = auth.uid());

-- 5. Grant access
GRANT SELECT ON public.countries TO anon, authenticated;
GRANT SELECT ON public.currencies TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.organizations TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.organization_members TO authenticated;
GRANT SELECT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;