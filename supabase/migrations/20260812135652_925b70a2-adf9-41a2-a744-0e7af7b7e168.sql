-- Internal privileged implementations (private schema, not exposed via API)
CREATE OR REPLACE FUNCTION private.get_user_tenants()
RETURNS SETOF uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT tenant_id FROM public.tenant_members WHERE user_id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION private.is_platform_admin_current()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (SELECT 1 FROM public.platform_admins WHERE user_id = auth.uid());
$$;

GRANT EXECUTE ON FUNCTION private.get_user_tenants() TO authenticated;
GRANT EXECUTE ON FUNCTION private.is_platform_admin_current() TO authenticated;

-- Public API surface becomes SECURITY INVOKER wrappers
CREATE OR REPLACE FUNCTION public.get_user_tenants()
RETURNS SETOF uuid
LANGUAGE sql
STABLE SECURITY INVOKER
SET search_path TO 'public'
AS $$
  SELECT private.get_user_tenants();
$$;

CREATE OR REPLACE FUNCTION public.is_platform_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY INVOKER
SET search_path TO 'public'
AS $$
  SELECT private.is_platform_admin_current();
$$;

REVOKE ALL ON FUNCTION public.get_user_tenants() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_platform_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_user_tenants() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_platform_admin() TO authenticated, service_role;