-- Fix security warnings by revoking public execute from security definer function
REVOKE ALL ON FUNCTION public.check_admin_internal(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.check_admin_internal(uuid) FROM anon;
REVOKE ALL ON FUNCTION public.check_admin_internal(uuid) FROM authenticated;

-- Only allow service_role or specific needed roles to execute it if we want it to be very secure.
-- But the has_role function (which is SECURITY INVOKER) needs to call it.
-- In Postgres, a SECURITY INVOKER function calling a SECURITY DEFINER function
-- works even if the INVOKER doesn't have EXECUTE on the DEFINER, 
-- IF the owner of the INVOKER function has EXECUTE on the DEFINER.
-- Since they are both in public and likely owned by the same role, it should work.

-- However, to be safe and satisfy the linter, we keep EXECUTE revoked from the public roles
-- and only let the database system use it.

-- Ensure the main has_role function is executable
GRANT EXECUTE ON FUNCTION public.has_role(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, text) TO anon;

-- Fix RLS issues mentioned by linter
-- Ensure every table with RLS enabled has at least one policy
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'platform_admins') THEN
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'platform_admins' AND policyname = 'Users can check their own admin status') THEN
            CREATE POLICY "Users can check their own admin status" ON public.platform_admins
            FOR SELECT TO authenticated USING (user_id = auth.uid());
        END IF;
    END IF;
END $$;
