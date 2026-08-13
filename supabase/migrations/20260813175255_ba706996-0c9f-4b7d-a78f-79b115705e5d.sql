
-- Fix Warn 1, 2, 4: sync_legacy_roles
ALTER FUNCTION public.sync_legacy_roles() SET search_path = public;
REVOKE EXECUTE ON FUNCTION public.sync_legacy_roles() FROM public;
REVOKE EXECUTE ON FUNCTION public.sync_legacy_roles() FROM authenticated;

-- Fix Warn 1, 3, 5: has_permission
-- Already has search_path set in the previous migration, but reinforcing.
ALTER FUNCTION public.has_permission(text, uuid) SET search_path = public;
-- Restricted to authenticated users but linter wants explicit revoke from public if it's security definer
REVOKE EXECUTE ON FUNCTION public.has_permission(text, uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.has_permission(text, uuid) TO authenticated;
