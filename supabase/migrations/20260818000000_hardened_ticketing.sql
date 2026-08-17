-- FASE 1 & 2: CONSOLIDAÇÃO DO BANCO E RPC ATÔMICA
-- ZIP 14 - ZEVVA TICKETS

-- Depreciar colunas antigas e garantir novas
DO $$ 
BEGIN
    -- Se existirem colunas com nomes antigos, renomear ou garantir que as novas existam
    -- O schema atual ja tem event_id, owner_id, etc. 
    -- Vamos garantir token_hash como único e NOT NULL
    ALTER TABLE public.tickets ALTER COLUMN token_hash SET NOT NULL;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'tickets_token_hash_key') THEN
        ALTER TABLE public.tickets ADD CONSTRAINT tickets_token_hash_key UNIQUE (token_hash);
    END IF;
END $$;

-- Criar extensão pgcrypto se não existir para hashing no banco
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Função de Check-in Hardened (Fase 12 & 13)
CREATE OR REPLACE FUNCTION public.process_ticket_checkin(
    _raw_token text,
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
    _token_hash text;
    _ticket record;
    _now timestamptz := now();
BEGIN
    -- O scanner envia o token bruto, o banco calcula o hash para comparação
    _token_hash := encode(digest(_raw_token, 'sha256'), 'hex');

    -- SELECT FOR UPDATE para evitar race conditions (Atomicidade)
    SELECT * INTO _ticket
    FROM public.tickets
    WHERE token_hash = _token_hash
    AND tenant_id = _tenant_id
    FOR UPDATE;

    -- 1. Token não encontrado
    IF _ticket.id IS NULL THEN
        INSERT INTO public.checkin_logs (event_id, operator_id, tenant_id, action, token_hash)
        VALUES (_event_id, _operator_id, _tenant_id, 'invalid_token', _token_hash);
        
        RETURN jsonb_build_object(
            'success', false, 
            'code', 'INVALID_TOKEN', 
            'message', 'Ingresso não encontrado ou inválido.'
        );
    END IF;

    -- 2. Evento errado
    IF _ticket.event_id <> _event_id THEN
        INSERT INTO public.checkin_logs (event_id, ticket_id, operator_id, tenant_id, action, token_hash)
        VALUES (_event_id, _ticket.id, _operator_id, _tenant_id, 'wrong_event', _token_hash);
        
        RETURN jsonb_build_object(
            'success', false, 
            'code', 'WRONG_EVENT', 
            'message', 'Este ingresso pertence a outro evento.'
        );
    END IF;

    -- 3. Já utilizado
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

    -- 4. Cancelado/Reembolsado
    IF _ticket.status IN ('cancelado', 'refunded', 'expired', 'transferido') THEN
        INSERT INTO public.checkin_logs (event_id, ticket_id, operator_id, tenant_id, action, token_hash)
        VALUES (_event_id, _ticket.id, _operator_id, _tenant_id, 'cancelled', _token_hash);

        RETURN jsonb_build_object(
            'success', false, 
            'code', 'CANCELLED', 
            'message', 'Este ingresso foi cancelado ou invalidado.'
        );
    END IF;

    -- 5. Sucesso - Atualização Condicional
    UPDATE public.tickets
    SET 
        status = 'utilizado', 
        checked_in_at = _now,
        attendance_source = 'qrcode'
    WHERE id = _ticket.id
    AND status = 'valido' -- Double check no momento do update
    AND checked_in_at IS NULL;

    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false, 
            'code', 'RACE_CONDITION', 
            'message', 'Erro de processamento simultâneo. Tente novamente.'
        );
    END IF;

    INSERT INTO public.checkin_logs (event_id, ticket_id, operator_id, tenant_id, action, token_hash)
    VALUES (_event_id, _ticket.id, _operator_id, _tenant_id, 'success', _token_hash);

    RETURN jsonb_build_object(
        'success', true,
        'code', 'SUCCESS',
        'message', 'Check-in realizado com sucesso!',
        'attendee_name', _ticket.attendee_name,
        'ticket_type', _ticket.name -- Usando o campo denormalizado name da tabela tickets
    );
END;
$$;

-- Restringir execução
REVOKE ALL ON FUNCTION public.process_ticket_checkin(text, uuid, uuid, uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.process_ticket_checkin(text, uuid, uuid, uuid) TO authenticated, service_role;
