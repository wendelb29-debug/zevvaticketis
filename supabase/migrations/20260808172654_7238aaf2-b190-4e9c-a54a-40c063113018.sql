-- Harden log_resource_access: authenticated-only, admin-guarded
CREATE OR REPLACE FUNCTION public.log_resource_access(_resource_type text, _resource_id text DEFAULT NULL::text, _action text DEFAULT 'view'::text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    IF auth.uid() IS NULL THEN
        RETURN;
    END IF;

    IF NOT private.is_platform_admin(auth.uid()) THEN
        RETURN;
    END IF;

    INSERT INTO public.access_logs (admin_id, resource_type, resource_id, action)
    VALUES (auth.uid(), _resource_type, _resource_id, _action);
END;
$function$;

REVOKE ALL ON FUNCTION public.log_resource_access(text, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.log_resource_access(text, text, text) TO authenticated, service_role;

-- Ensure no anon execute on other definer functions in public
REVOKE ALL ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.has_role(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, text) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.ensure_producer_organization_admin(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.ensure_producer_organization_admin(uuid) TO service_role;

REVOKE ALL ON FUNCTION public.promote_to_platform_admin(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.promote_to_platform_admin(text) TO service_role;

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;