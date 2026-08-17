
-- 1. Create Advertisers Table
CREATE TABLE IF NOT EXISTS public.ad_advertisers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    company_name TEXT,
    tax_id TEXT, -- Documento (CNPJ/CPF)
    email TEXT,
    phone TEXT,
    whatsapp TEXT,
    website TEXT,
    logo_url TEXT,
    status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('ativo', 'inativo', 'bloqueado', 'pendente')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.ad_advertisers TO authenticated;
GRANT ALL ON public.ad_advertisers TO service_role;
ALTER TABLE public.ad_advertisers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can see all advertisers" ON public.ad_advertisers FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can see their org advertisers" ON public.ad_advertisers FOR SELECT TO authenticated USING (organization_id IN (SELECT tenant_id FROM public.tenant_members WHERE user_id = auth.uid()));

-- 2. Create Ad Campaigns Table
CREATE TABLE IF NOT EXISTS public.ad_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
    advertiser_id UUID REFERENCES public.ad_advertisers(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    internal_notes TEXT,
    status TEXT NOT NULL DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'aguardando_aprovacao', 'aprovada', 'agendada', 'ativa', 'pausada', 'encerrada', 'rejeitada', 'cancelada')),
    priority INTEGER DEFAULT 0,
    
    -- Billing & Limits
    billing_model TEXT NOT NULL DEFAULT 'periodo_fixo' CHECK (billing_model IN ('periodo_fixo', 'cpm', 'cpc', 'institucional')),
    budget_contracted NUMERIC(15,2) DEFAULT 0,
    budget_paid NUMERIC(15,2) DEFAULT 0,
    impression_limit INTEGER,
    click_limit INTEGER,
    
    -- Schedule
    start_at TIMESTAMPTZ NOT NULL,
    end_at TIMESTAMPTZ NOT NULL,
    timezone TEXT DEFAULT 'America/Sao_Paulo',
    
    -- Targeting (JSONB for flexibility: device, location, categories)
    targeting JSONB DEFAULT '{}'::jsonb,
    frequency_cap JSONB DEFAULT '{}'::jsonb, -- e.g. { 'per_session': 1, 'per_day': 1 }
    
    -- Admin
    created_by UUID REFERENCES auth.users(id),
    approved_by UUID REFERENCES auth.users(id),
    approved_at TIMESTAMPTZ,
    rejection_reason TEXT,
    
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.ad_campaigns TO authenticated;
GRANT ALL ON public.ad_campaigns TO service_role;
GRANT SELECT ON public.ad_campaigns TO anon; -- Needed for serving ads on home
ALTER TABLE public.ad_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all campaigns" ON public.ad_campaigns FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can manage their org campaigns" ON public.ad_campaigns FOR ALL TO authenticated USING (organization_id IN (SELECT tenant_id FROM public.tenant_members WHERE user_id = auth.uid()));
CREATE POLICY "Public can see active campaigns" ON public.ad_campaigns FOR SELECT TO anon USING (status = 'ativa' AND start_at <= now() AND end_at >= now());

-- 3. Create Ad Creatives Table
CREATE TABLE IF NOT EXISTS public.ad_creatives (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES public.ad_campaigns(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    cta_label TEXT DEFAULT 'Saiba mais',
    destination_url TEXT NOT NULL,
    image_desktop_url TEXT NOT NULL,
    image_mobile_url TEXT,
    alt_text TEXT,
    utm_params JSONB DEFAULT '{}'::jsonb,
    version INTEGER DEFAULT 1,
    status TEXT DEFAULT 'ativo',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.ad_creatives TO authenticated;
GRANT ALL ON public.ad_creatives TO service_role;
GRANT SELECT ON public.ad_creatives TO anon;
ALTER TABLE public.ad_creatives ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all creatives" ON public.ad_creatives FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can manage their org creatives" ON public.ad_creatives FOR ALL TO authenticated USING (campaign_id IN (SELECT id FROM public.ad_campaigns WHERE organization_id IN (SELECT tenant_id FROM public.tenant_members WHERE user_id = auth.uid())));
CREATE POLICY "Public can see active creatives" ON public.ad_creatives FOR SELECT TO anon USING (campaign_id IN (SELECT id FROM public.ad_campaigns WHERE status = 'ativa'));

-- 4. Create Ad Metrics Table (Hyper-table style)
CREATE TABLE IF NOT EXISTS public.ad_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    campaign_id UUID REFERENCES public.ad_campaigns(id) ON DELETE CASCADE NOT NULL,
    creative_id UUID REFERENCES public.ad_creatives(id) ON DELETE CASCADE NOT NULL,
    event_type TEXT NOT NULL CHECK (event_type IN ('eligible', 'served', 'impression', 'click', 'minimize', 'close', 'swipe_dismiss')),
    session_id TEXT,
    device_hash TEXT,
    page_path TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    occurred_at TIMESTAMPTZ DEFAULT now()
);

GRANT SELECT, INSERT ON public.ad_metrics TO authenticated;
GRANT SELECT, INSERT ON public.ad_metrics TO anon;
GRANT ALL ON public.ad_metrics TO service_role;
ALTER TABLE public.ad_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can see all metrics" ON public.ad_metrics FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can see their org metrics" ON public.ad_metrics FOR SELECT TO authenticated USING (organization_id IN (SELECT tenant_id FROM public.tenant_members WHERE user_id = auth.uid()));
CREATE POLICY "Anyone can insert metrics" ON public.ad_metrics FOR INSERT TO anon, authenticated WITH CHECK (true);

-- 5. Add permissions to RBAC
INSERT INTO public.permission_definitions (key, name, module, description) VALUES
('ads.view', 'Visualizar Anúncios', 'Marketing', 'Permite visualizar o dashboard e lista de anúncios'),
('ads.create', 'Criar Anúncios', 'Marketing', 'Permite criar novos anunciantes e campanhas'),
('ads.approve', 'Aprovar Anúncios', 'Marketing', 'Permite aprovar ou rejeitar campanhas (Master Admin)'),
('ads.financial', 'Gestão Financeira Ads', 'Marketing', 'Permite visualizar e gerenciar orçamentos de publicidade')
ON CONFLICT (key) DO NOTHING;
