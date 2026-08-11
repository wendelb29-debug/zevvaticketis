-- Ensure private schema exists (though it should)
CREATE SCHEMA IF NOT EXISTS private;

-- Redefine the internal check to be more robust
CREATE OR REPLACE FUNCTION private.has_role_internal(_user_id uuid, _role text)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF _role = 'admin' THEN
    RETURN EXISTS (
      SELECT 1 FROM public.platform_admins WHERE user_id = _user_id
    );
  END IF;

  RETURN EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role::text = _role
  );
END;
$function$;

-- Ensure public.has_role is using it correctly
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role text)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE
 SECURITY INVOKER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- We allow the user to check their own role
  IF auth.uid() IS NULL OR _user_id <> auth.uid() THEN
    RETURN false;
  END IF;
  
  RETURN private.has_role_internal(_user_id, _role);
END;
$function$;

-- Revoke all on functions then grant select
REVOKE ALL ON FUNCTION public.has_role(uuid, text) FROM public;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, text) TO authenticated;

-- Ensure platform_admins has proper grants
GRANT SELECT ON public.platform_admins TO authenticated;
GRANT ALL ON public.platform_admins TO service_role;

-- Update policy to allow users to see if they are admin (redundant with grant but good for RLS)
DROP POLICY IF EXISTS "Admins can read own record" ON public.platform_admins;
CREATE POLICY "Users can check their own admin status" ON public.platform_admins
  FOR SELECT TO authenticated USING (user_id = auth.uid());

-- Re-verify Wendel is in the table
INSERT INTO public.platform_admins (user_id)
VALUES ('101eccb0-32f3-4fa0-938f-827d36ee4380')
ON CONFLICT (user_id) DO NOTHING;
