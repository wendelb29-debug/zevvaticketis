-- Allow authenticated to call the internal helper (needed once has_role is INVOKER)
GRANT EXECUTE ON FUNCTION private.has_role_internal(uuid, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role text)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path TO 'public'
AS $function$
BEGIN
  IF auth.uid() IS NULL OR _user_id <> auth.uid() THEN
    RETURN false;
  END IF;
  RETURN private.has_role_internal(_user_id, _role);
END;
$function$;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path TO 'public'
AS $function$
BEGIN
  IF auth.uid() IS NULL OR _user_id <> auth.uid() THEN
    RETURN false;
  END IF;
  RETURN private.has_role_internal(_user_id, _role::text);
END;
$function$;

-- Access logging must not be callable directly by signed-in users
REVOKE EXECUTE ON FUNCTION public.log_resource_access(text, text, text) FROM authenticated, anon, public;