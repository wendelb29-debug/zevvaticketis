-- Helper: does the current user belong to a given organization? (security definer avoids recursion)
CREATE OR REPLACE FUNCTION public.is_org_member(_org_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE organization_id = _org_id AND user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.org_has_members(_org_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.organization_members WHERE organization_id = _org_id);
$$;

REVOKE ALL ON FUNCTION public.is_org_member(uuid) FROM public, anon;
REVOKE ALL ON FUNCTION public.org_has_members(uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.is_org_member(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.org_has_members(uuid) TO authenticated, service_role;

-- 1. organization_members: fix broken (always-true) membership read policy
DROP POLICY IF EXISTS "Members can read organization members" ON public.organization_members;
CREATE POLICY "Members can read organization members"
ON public.organization_members
FOR SELECT TO authenticated
USING (public.is_org_member(organization_id));

-- 2. organization_members: remove anonymous unrestricted insert
DROP POLICY IF EXISTS "Allow anon to insert member during signup" ON public.organization_members;
CREATE POLICY "Users can claim ownership of an empty organization"
ON public.organization_members
FOR INSERT TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND role = 'produtor_owner'
  AND NOT public.org_has_members(organization_id)
);

-- 3. organizations: remove anonymous unrestricted insert
DROP POLICY IF EXISTS "Allow anon to insert organization during signup" ON public.organizations;
CREATE POLICY "Authenticated users can create pending organizations"
ON public.organizations
FOR INSERT TO authenticated
WITH CHECK (
  status = 'pendente'
  AND plan_id IS NULL
  AND stripe_account_id IS NULL
  AND taxa_percentual_custom IS NULL
);

-- Secure signup completion path for producers (runs after the user is signed in)
CREATE OR REPLACE FUNCTION public.ensure_producer_organization()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  meta jsonb;
  new_org_id uuid;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Não autenticado.';
  END IF;

  IF EXISTS (SELECT 1 FROM public.organization_members WHERE user_id = uid) THEN
    RETURN json_build_object('created', false);
  END IF;

  SELECT raw_user_meta_data INTO meta FROM auth.users WHERE id = uid;

  IF coalesce(meta->>'role', '') <> 'produtor' THEN
    RETURN json_build_object('created', false);
  END IF;

  INSERT INTO public.organizations (nome, documento, pais_id, status)
  VALUES (
    coalesce(nullif(meta->>'org_nome', ''), coalesce(meta->>'nome', 'Organização')),
    nullif(meta->>'org_documento', ''),
    nullif(meta->>'org_pais_id', '')::uuid,
    'pendente'
  )
  RETURNING id INTO new_org_id;

  INSERT INTO public.organization_members (organization_id, user_id, role)
  VALUES (new_org_id, uid, 'produtor_owner');

  RETURN json_build_object('created', true, 'organization_id', new_org_id);
END;
$$;

REVOKE ALL ON FUNCTION public.ensure_producer_organization() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.ensure_producer_organization() TO authenticated, service_role;

-- 4. checkin_logs: correlate organization to the event's organization
DROP POLICY IF EXISTS "Members can view logs of their events" ON public.checkin_logs;
CREATE POLICY "Members can view logs of their events"
ON public.checkin_logs
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.tickets t
    JOIN public.events e ON e.id = t.event_id
    WHERE t.id = checkin_logs.ticket_id
      AND (
        e.producer_id = auth.uid()
        OR (e.organization_id IS NOT NULL AND public.is_org_member(e.organization_id))
      )
  )
);

-- 5. tickets: correlate check-in operator access to the event's organization
DROP POLICY IF EXISTS "Checkin operators can view and update tickets" ON public.tickets;
CREATE POLICY "Checkin operators can view and update tickets"
ON public.tickets
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.events e
    WHERE e.id = tickets.event_id
      AND e.organization_id IS NOT NULL
      AND public.is_org_member(e.organization_id)
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.events e
    WHERE e.id = tickets.event_id
      AND e.organization_id IS NOT NULL
      AND public.is_org_member(e.organization_id)
  )
);

-- 6 & 7. remove duplicate unrestricted public read policies
DROP POLICY IF EXISTS "Public can read countries" ON public.countries;
DROP POLICY IF EXISTS "Public can read currencies" ON public.currencies;
