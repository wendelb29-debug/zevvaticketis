-- Harden user_has_producer_role: self-scoped and not callable via API
CREATE OR REPLACE FUNCTION public.user_has_producer_role(_user_id uuid, _tenant_id uuid, _required_roles tenant_role[])
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path TO 'public'
AS $$
  SELECT CASE
    WHEN auth.uid() IS NULL OR _user_id <> auth.uid() THEN false
    ELSE EXISTS (
      SELECT 1 FROM public.tenant_members
      WHERE user_id = _user_id AND tenant_id = _tenant_id AND role = ANY(_required_roles)
    )
  END;
$$;

REVOKE ALL ON FUNCTION public.user_has_producer_role(uuid, uuid, tenant_role[]) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.user_has_producer_role(uuid, uuid, tenant_role[]) TO service_role;

-- Keep RLS helpers available (required by policies) but ensure they are self-scoped only
REVOKE ALL ON FUNCTION public.get_user_tenants() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_platform_admin() FROM PUBLIC, anon;