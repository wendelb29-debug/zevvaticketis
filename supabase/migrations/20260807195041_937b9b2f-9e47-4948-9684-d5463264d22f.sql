-- 1. Private, unexposed implementation used internally by RLS policies
CREATE OR REPLACE FUNCTION private.has_role_internal(_user_id uuid, _role text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
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

REVOKE ALL ON FUNCTION private.has_role_internal(uuid, text) FROM PUBLIC, anon, authenticated;

-- 2. Public wrappers can only answer about the caller themselves
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role text)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL OR _user_id <> auth.uid() THEN
    RETURN false;
  END IF;
  RETURN private.has_role_internal(_user_id, _role);
END;
$$;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL OR _user_id <> auth.uid() THEN
    RETURN false;
  END IF;
  RETURN private.has_role_internal(_user_id, _role::text);
END;
$$;

REVOKE ALL ON FUNCTION public.has_role(uuid, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION private.has_role_internal(uuid, text) TO service_role;