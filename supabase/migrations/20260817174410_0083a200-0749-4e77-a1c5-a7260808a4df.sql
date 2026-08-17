-- Migration to upgrade ticketing system to official Zevva standards (corrected)
-- 1. Create checkin_logs if not exists (Auditoria)
CREATE TABLE IF NOT EXISTS public.checkin_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id uuid REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
    ticket_id uuid, -- Can be null if QR is invalid
    operator_id uuid REFERENCES auth.users(id),
    tenant_id uuid NOT NULL,
    action text NOT NULL, -- 'attempt', 'success', 'already_used', 'invalid_token', 'wrong_event'
    token_hash text,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz DEFAULT now()
);

ALTER TABLE public.checkin_logs ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.checkin_logs TO authenticated;
GRANT ALL ON public.checkin_logs TO service_role;

-- 2. Upgrade TICKETS table
-- Add missing columns for security and attendee management
ALTER TABLE public.tickets 
ADD COLUMN IF NOT EXISTS token_hash text UNIQUE,
ADD COLUMN IF NOT EXISTS attendee_name text,
ADD COLUMN IF NOT EXISTS attendee_email text,
ADD COLUMN IF NOT EXISTS checked_in_at timestamptz,
ADD COLUMN IF NOT EXISTS tenant_id uuid,
ADD COLUMN IF NOT EXISTS design_config jsonb DEFAULT '{}'::jsonb;

-- 3. Upgrade EVENTS table for design configs
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS ticket_design_config jsonb DEFAULT '{}'::jsonb;

-- 4. Secure Validation Function (RPC)
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
    _checkin_id uuid;
    _now timestamptz := now();
BEGIN
    -- 1. Find ticket by token_hash
    SELECT * INTO _ticket 
    FROM public.tickets 
    WHERE token_hash = _token_hash 
    AND tenant_id = _tenant_id;

    -- 2. If ticket not found
    IF _ticket.id IS NULL THEN
        INSERT INTO public.checkin_logs (event_id, operator_id, tenant_id, action, token_hash)
        VALUES (_event_id, _operator_id, _tenant_id, 'invalid_token', _token_hash);
        
        RETURN jsonb_build_object(
            'success', false,
            'code', 'INVALID_TOKEN',
            'message', 'Ingresso não encontrado ou inválido.'
        );
    END IF;

    -- 3. If ticket belongs to another event
    IF _ticket.evento_id <> _event_id THEN
        INSERT INTO public.checkin_logs (event_id, ticket_id, operator_id, tenant_id, action, token_hash)
        VALUES (_event_id, _ticket.id, _operator_id, _tenant_id, 'wrong_event', _token_hash);

        RETURN jsonb_build_object(
            'success', false,
            'code', 'WRONG_EVENT',
            'message', 'Este ingresso pertence a outro evento.'
        );
    END IF;

    -- 4. Check if already used
    IF _ticket.status = 'utilizado' OR _ticket.checked_in_at IS NOT NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'code', 'ALREADY_USED',
            'message', 'Ingresso já utilizado.',
            'checked_in_at', _ticket.checked_in_at
        );
    END IF;

    -- 5. Check if cancelled
    IF _ticket.status = 'cancelado' THEN
        RETURN jsonb_build_object(
            'success', false,
            'code', 'CANCELLED',
            'message', 'Ingresso cancelado ou invalidado.'
        );
    END IF;

    -- 6. Atomic check-in
    UPDATE public.tickets 
    SET status = 'utilizado', 
        checked_in_at = _now 
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

-- 5. RLS Hardening for Tickets
-- In existing migration 'usuario_id' was used, but standard might be 'user_id'
-- Let's check which one exists or use both in a flexible policy if needed, 
-- but based on the error, 'usuario_id' was the one that failed.
-- Let's check columns for tickets first to be sure.
