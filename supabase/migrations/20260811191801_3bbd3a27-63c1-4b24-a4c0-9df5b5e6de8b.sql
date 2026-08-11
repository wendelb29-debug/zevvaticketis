
-- Fix SECURITY DEFINER search_path issues
ALTER FUNCTION public.get_user_tenants() SET search_path = public;

-- Fix Function Executable by public/anon issues (restrict to authenticated)
REVOKE EXECUTE ON FUNCTION public.get_user_tenants() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_user_tenants() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_tenants() TO service_role;

-- Note: Other linter warnings about "RLS Enabled No Policy" are usually for internal tables 
-- like access_logs, active_sessions, etc. if we just enabled them without policies.
-- Let's ensure access_logs has a policy if it's enabled.
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'access_logs' AND policyname = 'Admins can view access logs') THEN
        CREATE POLICY "Admins can view access logs" ON public.access_logs
        FOR SELECT TO authenticated
        USING (public.check_is_platform_admin(auth.uid()));
    END IF;
END $$;
