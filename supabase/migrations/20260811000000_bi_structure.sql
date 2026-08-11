-- BI Structure for Campaigns, Ads and Tracking

CREATE TABLE public.campaigns (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    nome text NOT NULL,
    origem text NOT NULL, -- Instagram, Facebook, Google, etc.
    evento_id uuid REFERENCES public.events(id) ON DELETE CASCADE,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE public.ads (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    campaign_id uuid REFERENCES public.campaigns(id) ON DELETE CASCADE,
    nome text NOT NULL,
    canal text NOT NULL, -- Feed, Stories, Search, etc.
    created_at timestamptz DEFAULT now()
);

CREATE TABLE public.tracking (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    campaign_id uuid REFERENCES public.campaigns(id) ON DELETE SET NULL,
    ad_id uuid REFERENCES public.ads(id) ON DELETE SET NULL,
    origem text,
    tipo_evento text NOT NULL, -- view, click, lead, signup
    metadata jsonb DEFAULT '{}',
    created_at timestamptz DEFAULT now()
);

CREATE TABLE public.sales_attribution (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE,
    campaign_id uuid REFERENCES public.campaigns(id) ON DELETE SET NULL,
    ad_id uuid REFERENCES public.ads(id) ON DELETE SET NULL,
    created_at timestamptz DEFAULT now()
);

-- Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.campaigns TO authenticated;
GRANT ALL ON public.campaigns TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.ads TO authenticated;
GRANT ALL ON public.ads TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.tracking TO authenticated;
GRANT ALL ON public.tracking TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.sales_attribution TO authenticated;
GRANT ALL ON public.sales_attribution TO service_role;

-- RLS
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_attribution ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own campaigns" ON public.campaigns FOR SELECT TO authenticated USING (auth.uid() = (SELECT producer_id FROM public.events WHERE id = evento_id));
CREATE POLICY "Admins can view all campaigns" ON public.campaigns FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view their own ads" ON public.ads FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.campaigns c JOIN public.events e ON e.id = c.evento_id WHERE c.id = campaign_id AND e.producer_id = auth.uid()));
CREATE POLICY "Admins can view all ads" ON public.ads FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Tracking is mostly public-ish for insertion from frontend
GRANT INSERT ON public.tracking TO anon;
CREATE POLICY "Anyone can insert tracking" ON public.tracking FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins/Producers can view tracking" ON public.tracking FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can view all attribution" ON public.sales_attribution FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
