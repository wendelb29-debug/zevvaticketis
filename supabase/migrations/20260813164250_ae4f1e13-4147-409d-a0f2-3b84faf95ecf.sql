-- team_invites: make broad policy read-only
DROP POLICY IF EXISTS "Tenant isolation" ON public.team_invites;

CREATE POLICY "Tenant members can view invites"
ON public.team_invites
FOR SELECT
TO authenticated
USING (
  tenant_id IN (SELECT tenant_id FROM public.tenant_members WHERE user_id = auth.uid())
  OR public.is_platform_admin()
);

-- ledger_entries: make broad policy read-only, restrict writes to owners/admins
DROP POLICY IF EXISTS "Tenant isolation" ON public.ledger_entries;

CREATE POLICY "Tenant members can view ledger entries"
ON public.ledger_entries
FOR SELECT
TO authenticated
USING (
  tenant_id IN (SELECT tenant_id FROM public.tenant_members WHERE user_id = auth.uid())
  OR public.is_platform_admin()
);

CREATE POLICY "Owners and admins can manage ledger entries"
ON public.ledger_entries
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.tenant_members tm
    WHERE tm.tenant_id = ledger_entries.tenant_id
      AND tm.user_id = auth.uid()
      AND tm.role IN ('OWNER'::tenant_role, 'ADMIN'::tenant_role)
  )
  OR public.is_platform_admin()
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.tenant_members tm
    WHERE tm.tenant_id = ledger_entries.tenant_id
      AND tm.user_id = auth.uid()
      AND tm.role IN ('OWNER'::tenant_role, 'ADMIN'::tenant_role)
  )
  OR public.is_platform_admin()
);