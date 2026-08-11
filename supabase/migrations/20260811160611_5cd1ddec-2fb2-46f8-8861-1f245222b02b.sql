-- 1. Tabela de Campanhas (Marketing)
CREATE TABLE IF NOT EXISTS public.campaigns (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
    name text NOT NULL,
    description text,
    status text DEFAULT 'active', -- active, paused, ended
    budget numeric DEFAULT 0,
    spend numeric DEFAULT 0,
    utm_source text,
    utm_medium text,
    utm_campaign text,
    start_date timestamp with time zone DEFAULT now(),
    end_date timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- 2. Tabela de Anúncios (Ads)
CREATE TABLE IF NOT EXISTS public.ads (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id uuid REFERENCES public.campaigns(id) ON DELETE CASCADE,
    name text NOT NULL,
    ad_type text, -- story, feed, search, etc.
    content_url text,
    utm_content text,
    utm_term text,
    status text DEFAULT 'active',
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- 3. Tabela de Tracking (Nav e UTMs)
CREATE TABLE IF NOT EXISTS public.tracking (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id text NOT NULL,
    user_id uuid REFERENCES auth.users(id),
    page_url text NOT NULL,
    referrer text,
    utm_source text,
    utm_medium text,
    utm_campaign text,
    utm_term text,
    utm_content text,
    ip_address text,
    user_agent text,
    created_at timestamp with time zone DEFAULT now()
);

-- 4. Tabela de Atribuição de Vendas
CREATE TABLE IF NOT EXISTS public.sales_attribution (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE,
    campaign_id uuid REFERENCES public.campaigns(id) ON DELETE SET NULL,
    ad_id uuid REFERENCES public.ads(id) ON DELETE SET NULL,
    tracking_id uuid REFERENCES public.tracking(id) ON DELETE SET NULL,
    attribution_method text DEFAULT 'last_click',
    created_at timestamp with time zone DEFAULT now()
);

-- 5. Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.campaigns TO authenticated;
GRANT ALL ON public.campaigns TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.ads TO authenticated;
GRANT ALL ON public.ads TO service_role;

GRANT SELECT, INSERT ON public.tracking TO authenticated;
GRANT SELECT, INSERT ON public.tracking TO anon;
GRANT ALL ON public.tracking TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.sales_attribution TO authenticated;
GRANT ALL ON public.sales_attribution TO service_role;

-- 6. RLS
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_attribution ENABLE ROW LEVEL SECURITY;

-- Policies for campaigns
CREATE POLICY "Admins and org members can manage campaigns" ON public.campaigns
FOR ALL TO authenticated
USING (
    check_is_platform_admin(auth.uid()) OR 
    EXISTS (
        SELECT 1 FROM public.organization_members 
        WHERE organization_id = campaigns.organization_id 
        AND user_id = auth.uid()
    )
);

-- Policies for ads
CREATE POLICY "Admins and org members can manage ads" ON public.ads
FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.campaigns c
        LEFT JOIN public.organization_members om ON om.organization_id = c.organization_id
        WHERE c.id = ads.campaign_id 
        AND (check_is_platform_admin(auth.uid()) OR om.user_id = auth.uid())
    )
);

-- Policies for tracking (public insert, restricted read)
CREATE POLICY "Anyone can insert tracking" ON public.tracking FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can read all tracking" ON public.tracking FOR SELECT TO authenticated USING (check_is_platform_admin(auth.uid()));

-- Policies for sales_attribution
CREATE POLICY "Admins and org members can read attribution" ON public.sales_attribution
FOR SELECT TO authenticated
USING (
    check_is_platform_admin(auth.uid()) OR
    EXISTS (
        SELECT 1 FROM public.orders o
        WHERE o.id = sales_attribution.order_id
        AND (
            o.buyer_id = auth.uid() OR
            EXISTS (
                SELECT 1 FROM public.organization_members om 
                WHERE om.organization_id = o.organization_id 
                AND om.user_id = auth.uid()
            )
        )
    )
);
