-- 1) Public admin check: switch to SECURITY INVOKER, self-only.
--    platform_admins already has an RLS policy letting users read their own row.
CREATE OR REPLACE FUNCTION public.check_is_platform_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path TO 'public'
AS $function$
  SELECT CASE
    WHEN auth.uid() IS NULL OR _user_id <> auth.uid() THEN false
    ELSE EXISTS (SELECT 1 FROM public.platform_admins WHERE user_id = auth.uid())
  END;
$function$;

REVOKE ALL ON FUNCTION public.check_is_platform_admin(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.check_is_platform_admin(uuid) TO authenticated, service_role;

-- 2) public.has_role(uuid, text) must not depend on check_admin_internal anymore
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role text)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path TO 'public'
AS $function$
BEGIN
  IF auth.uid() IS NULL OR _user_id <> auth.uid() THEN
    RETURN false;
  END IF;

  IF _role = 'admin' THEN
    RETURN EXISTS (SELECT 1 FROM public.platform_admins WHERE user_id = auth.uid());
  END IF;

  RETURN EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role::text = _role
  );
END;
$function$;

-- 3) Lock down remaining SECURITY DEFINER functions to internal/server use only
REVOKE ALL ON FUNCTION public.check_admin_internal(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.check_admin_internal(uuid) TO service_role;

REVOKE ALL ON FUNCTION public.ensure_producer_organization_admin(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.ensure_producer_organization_admin(uuid) TO service_role;

REVOKE ALL ON FUNCTION public.promote_to_platform_admin(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.promote_to_platform_admin(text) TO service_role;

REVOKE ALL ON FUNCTION public.log_resource_access(text, text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.log_resource_access(text, text, text) TO service_role;

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
