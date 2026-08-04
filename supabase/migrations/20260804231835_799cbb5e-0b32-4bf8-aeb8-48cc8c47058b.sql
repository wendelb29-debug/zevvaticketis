CREATE OR REPLACE FUNCTION public.ensure_producer_organization_admin(_uid uuid)
RETURNS json
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT private.ensure_producer_organization(_uid);
$$;

REVOKE ALL ON FUNCTION public.ensure_producer_organization_admin(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.ensure_producer_organization_admin(uuid) TO service_role;