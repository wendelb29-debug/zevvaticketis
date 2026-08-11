CREATE OR REPLACE FUNCTION private.is_org_checkin_staff(_org_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, private
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.organization_members m
    WHERE m.organization_id = _org_id
      AND m.user_id = auth.uid()
      AND (
        m.role IN ('owner','produtor_owner','admin','checkin','checkin_operator','operador_checkin')
        OR coalesce(m.permissions->>'permission','') IN ('owner','admin','checkin','checkin_operator','operador_checkin')
        OR coalesce((m.permissions->>'checkin')::boolean, false)
      )
  );
$$;

REVOKE ALL ON FUNCTION private.is_org_checkin_staff(uuid) FROM PUBLIC;

DROP POLICY IF EXISTS "Checkin operators can view and update tickets" ON public.tickets;

CREATE POLICY "Checkin staff can manage tickets"
ON public.tickets
FOR ALL
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.events e
  WHERE e.id = tickets.event_id
    AND e.organization_id IS NOT NULL
    AND private.is_org_checkin_staff(e.organization_id)
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.events e
  WHERE e.id = tickets.event_id
    AND e.organization_id IS NOT NULL
    AND private.is_org_checkin_staff(e.organization_id)
));