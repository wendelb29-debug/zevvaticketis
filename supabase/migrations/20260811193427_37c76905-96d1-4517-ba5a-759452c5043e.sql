-- 1. Fix mutable search_path on the SECURITY DEFINER admin check
CREATE OR REPLACE FUNCTION public.is_platform_admin()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (SELECT 1 FROM public.platform_admins WHERE user_id = auth.uid());
$function$;

-- 2. Revoke public execute on privileged SECURITY DEFINER functions that
--    must never be callable directly from the API.
REVOKE EXECUTE ON FUNCTION public.promote_to_platform_admin(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.promote_to_platform_admin(text) TO service_role;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- 3. RLS helper functions: not needed by anonymous visitors (all their policies
--    are auth.uid() scoped). Keep them available to signed-in users only.
REVOKE EXECUTE ON FUNCTION public.is_platform_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_platform_admin() TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.get_user_tenants() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_user_tenants() TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.user_has_producer_role(uuid, uuid, tenant_role[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.user_has_producer_role(uuid, uuid, tenant_role[]) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.ensure_producer_organization_admin(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.ensure_producer_organization_admin(uuid) TO authenticated, service_role;