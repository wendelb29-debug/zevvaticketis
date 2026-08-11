-- Create a migration to fix the admin check logic and ensure RLS is not blocking the RPC
-- Use only supported schemas and standard operations

-- 1. Create a security definer function for internal role checks
-- We place it in a way that bypasses RLS on the tables it reads
CREATE OR REPLACE FUNCTION public.check_admin_internal(_user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER -- Bypasses RLS to read platform_admins
 SET search_path TO 'public'
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.platform_admins WHERE user_id = _user_id
  );
END;
$$;

-- 2. Update the main has_role function to use it
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role text)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE
 SECURITY INVOKER
 SET search_path TO 'public'
AS $$
BEGIN
  -- Security check: users can only check their own roles
  IF auth.uid() IS NULL OR _user_id <> auth.uid() THEN
    RETURN false;
  END IF;

  IF _role = 'admin' THEN
    RETURN public.check_admin_internal(_user_id);
  END IF;

  -- Fallback for other roles (e.g. produtor)
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role::text = _role
  );
END;
$$;

-- 3. Ensure permissions are set correctly
GRANT EXECUTE ON FUNCTION public.has_role(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_admin_internal(uuid) TO authenticated;

-- Ensure Wendel is present
INSERT INTO public.platform_admins (user_id)
VALUES ('101eccb0-32f3-4fa0-938f-827d36ee4380')
ON CONFLICT (user_id) DO NOTHING;

-- Grant select on platform_admins so the getRedirectPath query works
GRANT SELECT ON public.platform_admins TO authenticated;
GRANT ALL ON public.platform_admins TO service_role;
