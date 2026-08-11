-- Revoke execute from authenticated for the sensitive promotion function
-- It should only be callable by service_role or via the RPC (which checks admin status)
REVOKE EXECUTE ON FUNCTION public.promote_to_platform_admin(text) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.promote_to_platform_admin(text) TO service_role;
