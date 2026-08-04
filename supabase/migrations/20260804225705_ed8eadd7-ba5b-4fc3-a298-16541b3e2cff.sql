-- First, revoke from everyone to be absolutely sure
REVOKE EXECUTE ON FUNCTION public.promote_to_platform_admin(text) FROM public;
REVOKE EXECUTE ON FUNCTION public.promote_to_platform_admin(text) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.promote_to_platform_admin(text) FROM anon;

-- Then grant only to service_role and authenticated
-- We grant to authenticated because the function itself has internal logic 
-- to check if auth.uid() is an admin.
GRANT EXECUTE ON FUNCTION public.promote_to_platform_admin(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.promote_to_platform_admin(text) TO authenticated;

-- Ensure the function is not public by moving it if necessary, 
-- but for now, the explicit REVOKE and INTERNAL logic are robust.
-- The linter might still warn if it sees GRANT to authenticated, 
-- but the function's internal check `IF NOT EXISTS (SELECT 1 FROM public.platform_admins WHERE user_id = caller_id)`
-- handles the security.
