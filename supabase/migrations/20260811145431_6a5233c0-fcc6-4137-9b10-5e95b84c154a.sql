-- Grant permissions on platform_admins
GRANT SELECT ON public.platform_admins TO authenticated;
GRANT SELECT ON public.platform_admins TO anon;
GRANT ALL ON public.platform_admins TO service_role;

-- Ensure RLS is active and has a policy
ALTER TABLE public.platform_admins ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public select own admin" ON public.platform_admins;
CREATE POLICY "Public select own admin" ON public.platform_admins FOR SELECT TO authenticated USING (user_id = auth.uid());
