CREATE OR REPLACE FUNCTION public.promote_to_platform_admin(target_email text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    target_user_id uuid;
    caller_id uuid;
BEGIN
    caller_id := auth.uid();
    
    -- If called by a user (not service role), check if they are admin
    IF caller_id IS NOT NULL THEN
        IF NOT EXISTS (SELECT 1 FROM public.platform_admins WHERE user_id = caller_id) THEN
            RAISE EXCEPTION 'Acesso negado. Apenas administradores podem promover outros usuários.';
        END IF;
    END IF;

    SELECT id INTO target_user_id FROM auth.users WHERE email = target_email;
    
    IF target_user_id IS NULL THEN
        RETURN json_build_object('success', false, 'message', 'Usuário não encontrado.');
    END IF;

    INSERT INTO public.platform_admins (user_id)
    VALUES (target_user_id)
    ON CONFLICT (user_id) DO NOTHING;

    RETURN json_build_object('success', true, 'message', 'Usuário promovido a Admin com sucesso.');
END;
$$;

REVOKE ALL ON FUNCTION public.promote_to_platform_admin(text) FROM public;
REVOKE ALL ON FUNCTION public.promote_to_platform_admin(text) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.promote_to_platform_admin(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.promote_to_platform_admin(text) TO authenticated;
