
CREATE OR REPLACE FUNCTION private.process_ticket_checkin(
    _token_hash text,
    _event_id uuid,
    _operator_id uuid,
    _tenant_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    _ticket record;
    _checkin_id uuid;
    _now timestamptz := now();
BEGIN
    SELECT * INTO _ticket
    FROM public.tickets
    WHERE token_hash = _token_hash
    AND tenant_id = _tenant_id;

    IF _ticket.id IS NULL THEN
        INSERT INTO public.checkin_logs (event_id, operator_id, tenant_id, action, token_hash)
        VALUES (_event_id, _operator_id, _tenant_id, 'invalid_token', _token_hash);
        RETURN jsonb_build_object('success', false, 'code', 'INVALID_TOKEN', 'message', 'Ingresso não encontrado ou inválido.');
    END IF;

    IF _ticket.evento_id <> _event_id THEN
        INSERT INTO public.checkin_logs (event_id, ticket_id, operator_id, tenant_id, action, token_hash)
        VALUES (_event_id, _ticket.id, _operator_id, _tenant_id, 'wrong_event', _token_hash);
        RETURN jsonb_build_object('success', false, 'code', 'WRONG_EVENT', 'message', 'Este ingresso pertence a outro evento.');
    END IF;

    IF _ticket.status = 'utilizado' OR _ticket.checked_in_at IS NOT NULL THEN
        RETURN jsonb_build_object('success', false, 'code', 'ALREADY_USED', 'message', 'Ingresso já utilizado.', 'checked_in_at', _ticket.checked_in_at);
    END IF;

    IF _ticket.status = 'cancelado' THEN
        RETURN jsonb_build_object('success', false, 'code', 'CANCELLED', 'message', 'Ingresso cancelado ou invalidado.');
    END IF;

    UPDATE public.tickets
    SET status = 'utilizado', checked_in_at = _now
    WHERE id = _ticket.id;

    INSERT INTO public.checkins (ticket_id, operador_id, created_at)
    VALUES (_ticket.id, _operator_id, _now)
    RETURNING id INTO _checkin_id;

    INSERT INTO public.checkin_logs (event_id, ticket_id, operator_id, tenant_id, action, token_hash)
    VALUES (_event_id, _ticket.id, _operator_id, _tenant_id, 'success', _token_hash);

    RETURN jsonb_build_object(
        'success', true,
        'code', 'SUCCESS',
        'message', 'Check-in realizado com sucesso!',
        'attendee_name', _ticket.attendee_name,
        'ticket_type', (SELECT nome FROM public.ticket_types WHERE id = _ticket.ticket_type_id)
    );
END;
$$;

REVOKE ALL ON FUNCTION private.process_ticket_checkin(text, uuid, uuid, uuid) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION private.process_ticket_checkin(text, uuid, uuid, uuid) TO service_role;

-- Public entry point is now SECURITY INVOKER and enforces authorization itself
CREATE OR REPLACE FUNCTION public.process_ticket_checkin(
    _token_hash text,
    _event_id uuid,
    _operator_id uuid,
    _tenant_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
    _uid uuid := auth.uid();
BEGIN
    IF _uid IS NULL THEN
        RETURN jsonb_build_object('success', false, 'code', 'UNAUTHORIZED', 'message', 'Autenticação obrigatória.');
    END IF;

    IF NOT (
        private.is_org_member(_tenant_id)
        OR private.is_org_checkin_staff(_tenant_id)
        OR private.is_platform_admin_current()
    ) THEN
        RETURN jsonb_build_object('success', false, 'code', 'FORBIDDEN', 'message', 'Você não tem permissão para validar ingressos desta organização.');
    END IF;

    RETURN private.process_ticket_checkin(_token_hash, _event_id, _uid, _tenant_id);
END;
$$;

REVOKE ALL ON FUNCTION public.process_ticket_checkin(text, uuid, uuid, uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.process_ticket_checkin(text, uuid, uuid, uuid) TO authenticated, service_role;
