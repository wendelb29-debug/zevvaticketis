-- Wave 3: Travel packages and Orders
CREATE TABLE IF NOT EXISTS public.ticket_types (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id uuid REFERENCES public.events(id) ON DELETE CASCADE,
    nome text NOT NULL,
    descricao text,
    quantidade int NOT NULL,
    quantidade_vendida int DEFAULT 0,
    valor numeric NOT NULL,
    moeda_id uuid REFERENCES public.currencies(id),
    data_inicial timestamptz,
    data_final timestamptz,
    taxa numeric,
    limite_por_cpf int DEFAULT 5,
    limite_por_compra int DEFAULT 5,
    cor text,
    ordem int,
    moeda_fixa_venda boolean DEFAULT false,
    formas_pagamento_permitidas text[] DEFAULT '{cartao_internacional, pix_cotacao_dia}',
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.trip_itinerary_days (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_type_id uuid REFERENCES public.ticket_types(id) ON DELETE CASCADE,
    dia_numero int NOT NULL,
    titulo text,
    descricao text,
    data date
);

CREATE TABLE IF NOT EXISTS public.trip_hotels (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_type_id uuid REFERENCES public.ticket_types(id) ON DELETE CASCADE,
    cidade text,
    nome_hotel text,
    categoria text,
    noites int,
    imagem_url text,
    descricao text
);

CREATE TABLE IF NOT EXISTS public.trip_cost_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_type_id uuid REFERENCES public.ticket_types(id) ON DELETE CASCADE,
    tipo text CHECK (tipo IN ('visto', 'almoco', 'gorjetas', 'transporte', 'seguro_viagem', 'outro')),
    incluso boolean DEFAULT true,
    valor_estimado numeric,
    moeda_id uuid REFERENCES public.currencies(id),
    observacao text
);

CREATE TABLE IF NOT EXISTS public.orders (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_id uuid REFERENCES auth.users(id),
    event_id uuid REFERENCES public.events(id),
    organization_id uuid REFERENCES public.organizations(id),
    status text CHECK (status IN ('pendente', 'pago', 'reembolsado', 'cancelado')) DEFAULT 'pendente',
    valor_bruto numeric NOT NULL,
    moeda_id uuid REFERENCES public.currencies(id),
    taxa_plataforma numeric,
    valor_liquido_produtor numeric,
    stripe_payment_intent_id text,
    forma_pagamento text,
    created_at timestamptz DEFAULT now()
);

-- Wave 5: Ledger
CREATE TABLE IF NOT EXISTS public.ledger_entries (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
    moeda_id uuid REFERENCES public.currencies(id),
    order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
    tipo text CHECK (tipo IN ('venda', 'taxa_plataforma', 'reembolso')),
    valor numeric NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- Wave 7: Platform Settings and Plans
CREATE TABLE IF NOT EXISTS public.plans (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    nome text NOT NULL,
    taxa_percentual numeric NOT NULL,
    limite_eventos int,
    limite_ingressos int,
    preco_mensal numeric,
    created_at timestamptz DEFAULT now()
);

-- Update existing tables with missing columns if any
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS plan_id uuid REFERENCES public.plans(id);

-- RLS and Grants
ALTER TABLE public.ticket_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_itinerary_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_cost_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ledger_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.ticket_types TO anon, authenticated;
GRANT SELECT ON public.trip_itinerary_days TO anon, authenticated;
GRANT SELECT ON public.trip_hotels TO anon, authenticated;
GRANT SELECT ON public.trip_cost_items TO anon, authenticated;
GRANT SELECT ON public.orders TO authenticated;
GRANT SELECT ON public.ledger_entries TO authenticated;
GRANT SELECT ON public.plans TO anon, authenticated;

GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;

-- Policies for orders and tickets
CREATE POLICY "Users can read own orders" ON public.orders FOR SELECT TO authenticated USING (buyer_id = auth.uid());
CREATE POLICY "Owners can read organization orders" ON public.orders FOR SELECT TO authenticated 
USING (EXISTS (SELECT 1 FROM public.organization_members WHERE organization_id = orders.organization_id AND user_id = auth.uid()));

CREATE POLICY "Owners can read ledger" ON public.ledger_entries FOR SELECT TO authenticated 
USING (EXISTS (SELECT 1 FROM public.organization_members WHERE organization_id = ledger_entries.organization_id AND user_id = auth.uid() AND (role = 'produtor_owner' OR permissions ? 'financeiro')));