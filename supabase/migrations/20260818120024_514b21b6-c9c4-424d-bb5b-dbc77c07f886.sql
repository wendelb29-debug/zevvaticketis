CREATE OR REPLACE FUNCTION public.get_master_tenant_details(_tenant_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_caller_id uuid;
    v_is_admin boolean;
    v_tenant_data jsonb;
BEGIN
    v_caller_id := auth.uid();
    
    -- 1. Validate authenticated
    IF v_caller_id IS NULL THEN
        RETURN jsonb_build_object('found', false, 'code', 'UNAUTHORIZED');
    END IF;

    -- 2. Check if global admin
    SELECT EXISTS (
        SELECT 1 FROM public.platform_admins WHERE user_id = v_caller_id
    ) INTO v_is_admin;

    IF NOT v_is_admin THEN
        RETURN jsonb_build_object('found', false, 'code', 'FORBIDDEN');
    END IF;

    -- 3. Fetch tenant data
    SELECT jsonb_build_object(
        'id', t.id,
        'nome', t.nome,
        'slug', t.slug,
        'logo', t.logo,
        'status', t.status,
        'plan', t.plan,
        'empresa', t.empresa,
        'telefone', t.telefone,
        'documento', t.documento,
        'created_at', t.created_at,
        'owner', jsonb_build_object(
            'nome', p.nome,
            'email', p.email
        ),
        'member_count', (SELECT count(*) FROM public.tenant_members WHERE tenant_id = t.id),
        'event_count', (SELECT count(*) FROM public.events WHERE tenant_id = t.id)
    ) INTO v_tenant_data
    FROM public.tenants t
    LEFT JOIN public.tenant_members tm ON tm.tenant_id = t.id AND tm.role = 'OWNER'
    LEFT JOIN public.profiles p ON p.id = tm.user_id
    WHERE t.id = _tenant_id;

    IF v_tenant_data IS NULL THEN
        RETURN jsonb_build_object('found', false, 'code', 'TENANT_NOT_FOUND');
    END IF;

    RETURN jsonb_build_object('found', true, 'tenant', v_tenant_data);
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_master_tenant_details(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_master_tenant_details(uuid) TO service_role;
