
-- Fix the has_role function by casting correctly and simplifying logic
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If checking for admin, check platform_admins first
  IF _role = 'admin'::public.app_role THEN
    IF EXISTS (SELECT 1 FROM public.platform_admins WHERE user_id = _user_id) THEN
      RETURN TRUE;
    END IF;
  END IF;

  -- Then check organization_members
  RETURN EXISTS (
    SELECT 1
    FROM public.organization_members
    WHERE user_id = _user_id
      AND role::text = _role::text
  );
END;
$$;

-- Secure it
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;
