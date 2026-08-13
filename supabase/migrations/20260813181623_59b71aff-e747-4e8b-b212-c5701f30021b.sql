-- 1. Fix mutable search_path
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$;

-- 2. Move SECURITY DEFINER has_permission out of the exposed public schema
CREATE OR REPLACE FUNCTION private.has_permission(p_permission_key text, p_tenant_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    v_user_id uuid := auth.uid();
    v_is_owner boolean;
BEGIN
    IF v_user_id IS NULL THEN
        RETURN false;
    END IF;

    SELECT EXISTS (
        SELECT 1 FROM public.tenant_members
        WHERE tenant_id = p_tenant_id
          AND user_id = v_user_id
          AND role = 'OWNER'
    ) INTO v_is_owner;

    IF v_is_owner THEN
        RETURN true;
    END IF;

    RETURN EXISTS (
        SELECT 1
        FROM public.project_member_roles pmr
        JOIN public.role_permissions rp ON pmr.role_id = rp.role_id
        JOIN public.permission_definitions pd ON rp.permission_id = pd.id
        WHERE pmr.tenant_id = p_tenant_id
          AND pmr.user_id = v_user_id
          AND pd.key = p_permission_key
          AND pd.is_active = true
    );
END;
$function$;

REVOKE ALL ON FUNCTION private.has_permission(text, uuid) FROM PUBLIC, anon, authenticated;

DROP FUNCTION IF EXISTS public.has_permission(text, uuid);