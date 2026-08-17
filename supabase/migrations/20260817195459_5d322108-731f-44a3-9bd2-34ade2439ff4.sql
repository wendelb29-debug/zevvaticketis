-- 1) Remove direct anon access to ad_campaigns base table
DROP POLICY IF EXISTS "Anon can read active campaign basics" ON public.ad_campaigns;
REVOKE ALL ON public.ad_campaigns FROM anon;

-- Public sanitized view: definer semantics so it works without base-table anon policy
ALTER VIEW public.ad_campaigns_public SET (security_invoker = off);
REVOKE ALL ON public.ad_campaigns_public FROM anon, authenticated;
GRANT SELECT ON public.ad_campaigns_public TO anon, authenticated;

-- 2) Lock down SECURITY DEFINER check-in RPC to server-side (service_role) only
CREATE OR REPLACE FUNCTION public.process_ticket_checkin(_raw_token text, _event_id uuid, _operator_id uuid, _tenant_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    _token_hash text;
    _ticket record;
    _now timestamptz := now();
    _caller uuid := coalesce(auth.uid(), _operator_id);
BEGIN
    IF _caller IS NULL OR _operator_id IS DISTINCT FROM _caller THEN
        RAISE EXCEPTION 'Não autorizado';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM public.tenant_members tm
        WHERE tm.user_id = _caller AND tm.tenant_id = _tenant_id
    ) AND NOT EXISTS (
        SELECT 1 FROM public.event_staff es
        WHERE es.user_id = _caller AND es.event_id = _event_id
    ) AND NOT EXISTS (
        SELECT 1 FROM public.platform_admins pa WHERE pa.user_id = _caller
    ) THEN
        RAISE EXCEPTION 'Acesso negado a este evento';
    END IF;

    _token_hash := encode(digest(_raw_token, 'sha256'), 'hex');

    SELECT * INTO _ticket
    FROM public.tickets
    WHERE token_hash = _token_hash
    AND tenant_id = _tenant_id
    FOR UPDATE;

    IF _ticket.id IS NULL THEN
        INSERT INTO public.checkin_logs (event_id, operator_id, tenant_id, action, token_hash)
        VALUES (_event_id, _operator_id, _tenant_id, 'invalid_token', _token_hash);
        RETURN jsonb_build_object('success', false, 'code', 'INVALID_TOKEN', 'message', 'Ingresso não encontrado ou inválido.');
    END IF;

    IF _ticket.event_id <> _event_id THEN
        INSERT INTO public.checkin_logs (event_id, ticket_id, operator_id, tenant_id, action, token_hash)
        VALUES (_event_id, _ticket.id, _operator_id, _tenant_id, 'wrong_event', _token_hash);
        RETURN jsonb_build_object('success', false, 'code', 'WRONG_EVENT', 'message', 'Este ingresso pertence a outro evento.');
    END IF;

    IF _ticket.status = 'utilizado' OR _ticket.checked_in_at IS NOT NULL THEN
        INSERT INTO public.checkin_logs (event_id, ticket_id, operator_id, tenant_id, action, token_hash)
        VALUES (_event_id, _ticket.id, _operator_id, _tenant_id, 'already_used', _token_hash);
        RETURN jsonb_build_object('success', false, 'code', 'ALREADY_USED', 'message', 'Ingresso já utilizado.', 'checked_in_at', _ticket.checked_in_at);
    END IF;

    IF _ticket.status IN ('cancelado', 'refunded', 'expired', 'transferido') THEN
        INSERT INTO public.checkin_logs (event_id, ticket_id, operator_id, tenant_id, action, token_hash)
        VALUES (_event_id, _ticket.id, _operator_id, _tenant_id, 'cancelled', _token_hash);
        RETURN jsonb_build_object('success', false, 'code', 'CANCELLED', 'message', 'Este ingresso foi cancelado ou invalidado.');
    END IF;

    UPDATE public.tickets
    SET status = 'utilizado', checked_in_at = _now, attendance_source = 'qrcode'
    WHERE id = _ticket.id AND status = 'valido' AND checked_in_at IS NULL;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'code', 'RACE_CONDITION', 'message', 'Erro de processamento simultâneo. Tente novamente.');
    END IF;

    INSERT INTO public.checkin_logs (event_id, ticket_id, operator_id, tenant_id, action, token_hash)
    VALUES (_event_id, _ticket.id, _operator_id, _tenant_id, 'success', _token_hash);

    RETURN jsonb_build_object('success', true, 'code', 'SUCCESS', 'message', 'Check-in realizado com sucesso!', 'attendee_name', _ticket.attendee_name, 'ticket_type', _ticket.name);
END;
$function$;

REVOKE ALL ON FUNCTION public.process_ticket_checkin(text, uuid, uuid, uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.process_ticket_checkin(text, uuid, uuid, uuid) TO service_role;