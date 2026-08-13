
-- Revoke all on all functions for public and authenticated
REVOKE ALL ON FUNCTION public.sync_legacy_roles() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.sync_legacy_roles() FROM authenticated;
REVOKE ALL ON FUNCTION public.sync_legacy_roles() FROM anon;

REVOKE ALL ON FUNCTION public.has_permission(text, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.has_permission(text, uuid) FROM authenticated;
REVOKE ALL ON FUNCTION public.has_permission(text, uuid) FROM anon;

-- Explicitly grant only what is needed
GRANT EXECUTE ON FUNCTION public.has_permission(text, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_permission(text, uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.sync_legacy_roles() TO service_role;
