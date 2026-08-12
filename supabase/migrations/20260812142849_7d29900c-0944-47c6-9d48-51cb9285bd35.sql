
CREATE OR REPLACE FUNCTION private.is_org_owner_admin(_tenant_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.tenant_members tm
    WHERE tm.tenant_id = _tenant_id
      AND tm.user_id = auth.uid()
      AND tm.role IN ('OWNER','ADMIN')
  ) OR EXISTS (
    SELECT 1 FROM public.platform_admins pa WHERE pa.user_id = auth.uid()
  );
$$;

REVOKE ALL ON FUNCTION private.is_org_owner_admin(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.is_org_owner_admin(uuid) TO authenticated;

DROP POLICY IF EXISTS "Tenant isolation" ON public.tenant_members;

CREATE POLICY "Members can read their tenant members"
ON public.tenant_members FOR SELECT TO authenticated
USING (tenant_id IN (SELECT get_user_tenants()) OR is_platform_admin());

CREATE POLICY "Owners and admins can add members"
ON public.tenant_members FOR INSERT TO authenticated
WITH CHECK (private.is_org_owner_admin(tenant_id));

CREATE POLICY "Owners and admins can update members"
ON public.tenant_members FOR UPDATE TO authenticated
USING (private.is_org_owner_admin(tenant_id))
WITH CHECK (private.is_org_owner_admin(tenant_id));

CREATE POLICY "Owners and admins can remove members"
ON public.tenant_members FOR DELETE TO authenticated
USING (private.is_org_owner_admin(tenant_id));
