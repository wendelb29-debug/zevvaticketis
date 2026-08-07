-- 1. USERS (Roles handled by user_roles table, but we ensure profiles covers ticketing needs)
-- Profiles table already exists, but let's ensure it has necessary columns if missing
-- (Assuming profiles table already has 'nome', 'telefone' etc from previous context)

-- 2. EVENTS - Adjust or Create
-- The 'events' table was mentioned as existing, let's verify/update it.
CREATE TABLE IF NOT EXISTS public.events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    produtor_id uuid REFERENCES auth.users(id) NOT NULL,
    nome text NOT NULL,
    descricao text,
    imagem_url text,
    categoria text,
    localizacao text,
    cidade text,
    pais text DEFAULT 'Brasil',
    data_inicio timestamptz NOT NULL,
    data_fim timestamptz,
    status text NOT NULL DEFAULT 'rascunho', -- rascunho, aguardando_aprovacao, publicado, encerrado
    comissao_percent numeric DEFAULT 10.0,
    created_at timestamptz DEFAULT now()
);

-- 3. TICKET_TYPES
CREATE TABLE public.ticket_types (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    evento_id uuid REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
    nome text NOT NULL,
    descricao text,
    preco numeric NOT NULL DEFAULT 0,
    quantidade_total integer NOT NULL,
    quantidade_disponivel integer NOT NULL,
    lote integer DEFAULT 1,
    status text DEFAULT 'ativo',
    created_at timestamptz DEFAULT now()
);

-- 4. ORDERS
CREATE TABLE public.orders (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id uuid REFERENCES auth.users(id) NOT NULL,
    evento_id uuid REFERENCES public.events(id) NOT NULL,
    valor_total numeric NOT NULL,
    taxa_plataforma numeric NOT NULL,
    status text NOT NULL DEFAULT 'aguardando_pagamento', -- aguardando_pagamento, pago, cancelado, reembolsado
    payment_intent_id text, -- For Stripe/MercadoPago tracking
    created_at timestamptz DEFAULT now()
);

-- 5. TICKETS
CREATE TABLE public.tickets (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    evento_id uuid REFERENCES public.events(id) NOT NULL,
    usuario_id uuid REFERENCES auth.users(id) NOT NULL,
    ticket_type_id uuid REFERENCES public.ticket_types(id) NOT NULL,
    qr_code text UNIQUE NOT NULL,
    status text DEFAULT 'valido', -- valido, utilizado, cancelado
    created_at timestamptz DEFAULT now()
);

-- 6. CHECKINS
CREATE TABLE public.checkins (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id uuid REFERENCES public.tickets(id) NOT NULL,
    operador_id uuid REFERENCES auth.users(id) NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- RLS AND GRANTS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkins ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE ON public.events TO authenticated;
GRANT ALL ON public.events TO service_role;

GRANT SELECT, INSERT, UPDATE ON public.ticket_types TO authenticated;
GRANT ALL ON public.ticket_types TO service_role;

GRANT SELECT, INSERT ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;

GRANT SELECT ON public.tickets TO authenticated;
GRANT ALL ON public.tickets TO service_role;

GRANT SELECT, INSERT ON public.checkins TO authenticated;
GRANT ALL ON public.checkins TO service_role;

-- POLICIES

-- Events: Everyone can see published events, producers see theirs
CREATE POLICY "Public can see published events" ON public.events FOR SELECT USING (status = 'publicado');
CREATE POLICY "Producers can manage their events" ON public.events FOR ALL TO authenticated USING (produtor_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- Ticket Types: Everyone can see types of published events
CREATE POLICY "Public can see ticket types" ON public.ticket_types FOR SELECT USING (EXISTS (SELECT 1 FROM public.events WHERE id = evento_id AND status = 'publicado') OR public.has_role(auth.uid(), 'admin'));

-- Orders: Users see their own orders
CREATE POLICY "Users see own orders" ON public.orders FOR SELECT TO authenticated USING (usuario_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can create orders" ON public.orders FOR INSERT TO authenticated WITH CHECK (usuario_id = auth.uid());

-- Tickets: Users see their own tickets
CREATE POLICY "Users see own tickets" ON public.tickets FOR SELECT TO authenticated USING (usuario_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- Checkins: Staff and Admins can see and create
CREATE POLICY "Staff can manage checkins" ON public.checkins FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'staff') OR public.has_role(auth.uid(), 'admin'));

