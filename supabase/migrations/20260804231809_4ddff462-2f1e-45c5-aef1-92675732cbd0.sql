-- 1. Private schema for internal helpers (not exposed via Data API)
CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

-- 2. Recreate RLS helper functions inside private schema
CREATE OR REPLACE FUNCTION private.is_org_member(_org_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE organization_id = _org_id AND user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION private.org_has_members(_org_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.organization_members WHERE organization_id = _org_id);
$$;

CREATE OR REPLACE FUNCTION private.ensure_producer_organization(_uid uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  meta jsonb;
  new_org_id uuid;
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'Usuário inválido.';
  END IF;

  IF EXISTS (SELECT 1 FROM public.organization_members WHERE user_id = _uid) THEN
    RETURN json_build_object('created', false);
  END IF;

  SELECT raw_user_meta_data INTO meta FROM auth.users WHERE id = _uid;

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
  VALUES (new_org_id, _uid, 'produtor_owner');

  RETURN json_build_object('created', true, 'organization_id', new_org_id);
END;
$$;

REVOKE ALL ON FUNCTION private.is_org_member(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION private.org_has_members(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION private.ensure_producer_organization(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION private.is_org_member(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.org_has_members(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.ensure_producer_organization(uuid) TO service_role;

-- 3. Repoint policies to private helpers
DROP POLICY IF EXISTS "Members can read organization members" ON public.organization_members;
CREATE POLICY "Members can read organization members"
ON public.organization_members FOR SELECT TO authenticated
USING (private.is_org_member(organization_id));

DROP POLICY IF EXISTS "Users can claim ownership of an empty organization" ON public.organization_members;
CREATE POLICY "Users can claim ownership of an empty organization"
ON public.organization_members FOR INSERT TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND role = 'produtor_owner'
  AND NOT private.org_has_members(organization_id)
);

DROP POLICY IF EXISTS "Members can view logs of their events" ON public.checkin_logs;
CREATE POLICY "Members can view logs of their events"
ON public.checkin_logs FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.tickets t
    JOIN public.events e ON e.id = t.event_id
    WHERE t.id = checkin_logs.ticket_id
      AND (e.producer_id = auth.uid()
           OR (e.organization_id IS NOT NULL AND private.is_org_member(e.organization_id)))
  )
);

DROP POLICY IF EXISTS "Checkin operators can view and update tickets" ON public.tickets;
CREATE POLICY "Checkin operators can view and update tickets"
ON public.tickets FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.events e
    WHERE e.id = tickets.event_id
      AND e.organization_id IS NOT NULL
      AND private.is_org_member(e.organization_id)
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.events e
    WHERE e.id = tickets.event_id
      AND e.organization_id IS NOT NULL
      AND private.is_org_member(e.organization_id)
  )
);

-- 4. Drop the public-schema SECURITY DEFINER helpers now that nothing references them
DROP FUNCTION IF EXISTS public.is_org_member(uuid);
DROP FUNCTION IF EXISTS public.org_has_members(uuid);
DROP FUNCTION IF EXISTS public.ensure_producer_organization();

-- 5. Stop exposing issued ticket QR codes / owner identities publicly
DROP POLICY IF EXISTS "Public can view tickets for published events" ON public.tickets;
CREATE POLICY "Public can view ticket inventory for published events"
ON public.tickets FOR SELECT TO anon, authenticated
USING (
  owner_id IS NULL
  AND qr_code IS NULL
  AND EXISTS (
    SELECT 1 FROM public.events
    WHERE events.id = tickets.event_id
      AND events.status = 'publicado'
  )
);