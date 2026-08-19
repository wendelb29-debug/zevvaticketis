CREATE OR REPLACE FUNCTION public.get_master_tenant_details(_tenant_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    _caller_id uuid;
    _is_platform_admin boolean;
    _tenant_data record;
    _owner_data record;
    _usage_data json;
BEGIN
    -- 1. Authentication
    _caller_id := auth.uid();
    IF _caller_id IS NULL THEN
        RETURN json_build_object('success', false, 'code', 'UNAUTHORIZED', 'found', false);
    END IF;

    -- 2. Check if platform admin
    SELECT EXISTS (
        SELECT 1 FROM public.platform_admins WHERE user_id = _caller_id
    ) INTO _is_platform_admin;

    IF NOT _is_platform_admin THEN
        RETURN json_build_object('success', false, 'code', 'FORBIDDEN', 'found', false);
    END IF;

    -- 3. Fetch Tenant
    SELECT * FROM public.tenants WHERE id = _tenant_id INTO _tenant_data;
    
    IF _tenant_data.id IS NULL THEN
        RETURN json_build_object('success', false, 'code', 'TENANT_NOT_FOUND', 'found', false);
    END IF;

    -- 4. Fetch Owner (from organizations relationship or profiles)
    SELECT p.id, p.nome, p.email, p.avatar_url 
    FROM public.profiles p
    JOIN public.organizations o ON o.owner_id = p.id
    WHERE o.tenant_id = _tenant_id
    LIMIT 1
    INTO _owner_data;

    -- 5. Fetch Usage Stats
    SELECT json_build_object(
        'events', (SELECT count(*) FROM public.events WHERE tenant_id = _tenant_id),
        'tickets', (SELECT count(*) FROM public.tickets WHERE event_id IN (SELECT id FROM public.events WHERE tenant_id = _tenant_id)),
        'members', (SELECT count(*) FROM public.members WHERE organization_id IN (SELECT id FROM public.organizations WHERE tenant_id = _tenant_id)),
        'gmv', COALESCE((SELECT sum(total_amount) FROM public.orders WHERE tenant_id = _tenant_id AND status = 'paid'), 0),
        'revenue', COALESCE((SELECT sum(total_amount * 0.1) FROM public.orders WHERE tenant_id = _tenant_id AND status = 'paid'), 0)
    ) INTO _usage_data;

    -- 6. Construct Return Object
    RETURN json_build_object(
        'success', true,
        'code', 'SUCCESS',
        'found', true,
        'tenant', json_build_object(
            'id', _tenant_data.id,
            'name', _tenant_data.nome,
            'slug', _tenant_data.slug,
            'status', _tenant_data.status,
            'logo_url', _tenant_data.logo,
            'created_at', _tenant_data.created_at,
            'domain', _tenant_data.domain,
            'plan', 'Premium', 
            'owner', json_build_object(
                'id', _owner_data.id,
                'nome', COALESCE(_owner_data.nome, 'Desconhecido'),
                'email', _owner_data.email
            ),
            'usage', _usage_data
        )
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_master_tenant_details(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_master_tenant_details(uuid) TO service_role;
