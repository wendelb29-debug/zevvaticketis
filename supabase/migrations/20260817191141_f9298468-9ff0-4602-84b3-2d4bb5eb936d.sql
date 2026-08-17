ALTER TABLE public.checkin_logs ADD COLUMN IF NOT EXISTS ticket_id uuid;
ALTER TABLE public.checkin_logs ADD COLUMN IF NOT EXISTS tenant_id uuid;
ALTER TABLE public.checkin_logs ADD COLUMN IF NOT EXISTS token_hash text;

ALTER TABLE public.checkin_logs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'checkin_logs_isolation' AND tablename = 'checkin_logs') THEN
        CREATE POLICY "checkin_logs_isolation" ON public.checkin_logs
            FOR ALL
            TO authenticated
            USING (tenant_id IN (SELECT tm.tenant_id FROM public.tenant_members tm WHERE tm.user_id = auth.uid()));
    END IF;
END
$$;

CREATE OR REPLACE FUNCTION public.process_ticket_checkin(
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
    _now timestamptz := now();
BEGIN
    SELECT * INTO _ticket
    FROM public.tickets
    WHERE token_hash = _token_hash
    AND tenant_id = _tenant_id
    FOR UPDATE;

    IF _ticket.id IS NULL THEN
        INSERT INTO public.checkin_logs (event_id, operator_id, tenant_id, action, token_hash)
        VALUES (_event_id, _operator_id, _tenant_id, 'invalid_token', _token_hash);
        
        RETURN jsonb_build_object(
            'success', false, 
            'code', 'INVALID_TOKEN', 
            'message', 'Ingresso não encontrado ou inválido.'
        );
    END IF;

    IF _ticket.event_id <> _event_id THEN
        INSERT INTO public.checkin_logs (event_id, ticket_id, operator_id, tenant_id, action, token_hash)
        VALUES (_event_id, _ticket.id, _operator_id, _tenant_id, 'wrong_event', _token_hash);
        
        RETURN jsonb_build_object(
            'success', false, 
            'code', 'WRONG_EVENT', 
            'message', 'Este ingresso pertence a outro evento.'
        );
    END IF;

    IF _ticket.status = 'utilizado' OR _ticket.checked_in_at IS NOT NULL THEN
        INSERT INTO public.checkin_logs (event_id, ticket_id, operator_id, tenant_id, action, token_hash)
        VALUES (_event_id, _ticket.id, _operator_id, _tenant_id, 'already_used', _token_hash);

        RETURN jsonb_build_object(
            'success', false, 
            'code', 'ALREADY_USED', 
            'message', 'Ingresso já utilizado.', 
            'checked_in_at', _ticket.checked_in_at
        );
    END IF;

    IF _ticket.status IN ('cancelado', 'refunded', 'expired') THEN
        INSERT INTO public.checkin_logs (event_id, ticket_id, operator_id, tenant_id, action, token_hash)
        VALUES (_event_id, _ticket.id, _operator_id, _tenant_id, 'cancelled', _token_hash);

        RETURN jsonb_build_object(
            'success', false, 
            'code', 'CANCELLED', 
            'message', 'Este ingresso foi cancelado ou reembolsado.'
        );
    END IF;

    UPDATE public.tickets
    SET 
        status = 'utilizado', 
        checked_in_at = _now
    WHERE id = _ticket.id;

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
