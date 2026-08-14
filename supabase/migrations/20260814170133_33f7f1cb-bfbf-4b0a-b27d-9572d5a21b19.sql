-- Extensão de estoque e segurança
ALTER TABLE public.ticket_types ADD COLUMN stock_version int DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN two_factor_enabled boolean DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN two_factor_secret text;

-- Tabela de webhooks para idempotência
CREATE TABLE IF NOT EXISTS public.stripe_webhooks (
    id text PRIMARY KEY,
    status text NOT NULL DEFAULT 'pending',
    event_type text NOT NULL,
    payload jsonb NOT NULL,
    processed_at timestamptz,
    error_message text,
    created_at timestamptz DEFAULT now()
);

-- Grants para stripe_webhooks
GRANT SELECT, INSERT, UPDATE ON public.stripe_webhooks TO authenticated;
GRANT ALL ON public.stripe_webhooks TO service_role;

-- RLS para stripe_webhooks
ALTER TABLE public.stripe_webhooks ENABLE ROW LEVEL SECURITY;

-- Função auxiliar para verificar permissão (usando as tabelas existentes no sistema)
CREATE OR REPLACE FUNCTION public.check_user_is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.platform_admins
    WHERE user_id = _user_id
  )
$$;

CREATE POLICY "Platform Admins can view webhooks"
ON public.stripe_webhooks
FOR SELECT
TO authenticated
USING (public.check_user_is_admin(auth.uid()));

-- Função para processamento atômico de estoque
CREATE OR REPLACE FUNCTION public.reserve_tickets(
    _ticket_type_id uuid,
    _quantity int
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    _current_stock int;
    _sold int;
    _version int;
BEGIN
    -- Seleciona com lock
    SELECT quantidade, quantidade_vendida, stock_version 
    INTO _current_stock, _sold, _version
    FROM public.ticket_types
    WHERE id = _ticket_type_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Ticket type not found';
    END IF;

    -- Verifica disponibilidade
    IF (_current_stock - COALESCE(_sold, 0)) < _quantity THEN
        RETURN false;
    END IF;

    -- Atualiza
    UPDATE public.ticket_types
    SET quantidade_vendida = COALESCE(quantidade_vendida, 0) + _quantity,
        stock_version = stock_version + 1
    WHERE id = _ticket_type_id AND stock_version = _version;

    RETURN FOUND;
END;
$$;
