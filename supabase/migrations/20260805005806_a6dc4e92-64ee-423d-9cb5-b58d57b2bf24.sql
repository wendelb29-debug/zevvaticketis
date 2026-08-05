-- 1. Fix role conflation: 'admin' is platform-level only
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT CASE
    WHEN _role = 'admin' THEN EXISTS (
      SELECT 1 FROM public.platform_admins WHERE user_id = _user_id
    )
    ELSE EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE user_id = _user_id AND role = _role
    )
  END
$$;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT CASE
    WHEN _role = 'admin'::public.app_role THEN EXISTS (
      SELECT 1 FROM public.platform_admins WHERE user_id = _user_id
    )
    ELSE EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE user_id = _user_id AND role = _role::text
    )
  END
$$;

-- Prevent org roles from ever using the reserved platform role name
ALTER TABLE public.organization_members
  DROP CONSTRAINT IF EXISTS organization_members_role_not_admin;
ALTER TABLE public.organization_members
  ADD CONSTRAINT organization_members_role_not_admin
  CHECK (role <> 'admin');

-- 2. platform_settings: admins only
DROP POLICY IF EXISTS "Platform settings are viewable by authenticated users" ON public.platform_settings;
CREATE POLICY "Admins can view platform settings"
ON public.platform_settings FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.platform_admins WHERE user_id = auth.uid()));

-- 3. team_invites: only owners can write
DROP POLICY IF EXISTS "Members can manage organization invites" ON public.team_invites;

-- 4. Lock down SECURITY DEFINER function execution
REVOKE ALL ON FUNCTION public.promote_to_platform_admin(text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.ensure_producer_organization_admin(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.has_role(uuid, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.promote_to_platform_admin(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.ensure_producer_organization_admin(uuid) TO service_role;