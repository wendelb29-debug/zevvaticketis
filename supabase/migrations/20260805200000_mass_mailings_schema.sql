-- Schema for Mass Mailings (WhatsApp + Email)

-- Campaigns Table
CREATE TABLE public.campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('whatsapp', 'email')),
    status TEXT NOT NULL DEFAULT 'programada' CHECK (status IN ('enviando', 'programada', 'concluida', 'erro', 'pausada')),
    scheduled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    -- Stats
    total_contacts INTEGER DEFAULT 0,
    sent_count INTEGER DEFAULT 0,
    delivered_count INTEGER DEFAULT 0,
    failed_count INTEGER DEFAULT 0,
    opened_count INTEGER DEFAULT 0,
    responded_count INTEGER DEFAULT 0,
    
    -- Configuration
    settings JSONB DEFAULT '{}'::jsonb -- For limits per minute, etc.
);

-- Campaign Messages (Templates/Content)
CREATE TABLE public.campaign_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
    channel TEXT NOT NULL,
    subject TEXT, -- For email
    content TEXT NOT NULL,
    attachments JSONB DEFAULT '[]'::jsonb,
    action_buttons JSONB DEFAULT '[]'::jsonb,
    variables JSONB DEFAULT '[]'::jsonb, -- Store dynamic variables used
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Campaign Contacts (Recipients and Status)
CREATE TABLE public.campaign_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE, -- Assuming contacts are profiles
    status TEXT NOT NULL DEFAULT 'aguardando' CHECK (status IN ('aguardando', 'enviado', 'entregue', 'erro', 'aberto', 'respondido')),
    sent_at TIMESTAMPTZ,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Add indexes
CREATE INDEX idx_campaigns_org ON public.campaigns(organization_id);
CREATE INDEX idx_campaigns_status ON public.campaigns(status);
CREATE INDEX idx_campaign_contacts_campaign ON public.campaign_contacts(campaign_id);
CREATE INDEX idx_campaign_contacts_status ON public.campaign_contacts(status);

-- RLS
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_contacts ENABLE ROW LEVEL SECURITY;

-- Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.campaigns TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.campaign_messages TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.campaign_contacts TO authenticated;

GRANT ALL ON public.campaigns TO service_role;
GRANT ALL ON public.campaign_messages TO service_role;
GRANT ALL ON public.campaign_contacts TO service_role;

-- Policies (Simplified: org members can manage campaigns)
CREATE POLICY "Users can manage their organization's campaigns" 
ON public.campaigns
FOR ALL
TO authenticated
USING (
    organization_id IN (
        SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
    ) OR (public.has_role(auth.uid(), 'admin'))
);

CREATE POLICY "Users can manage their organization's campaign messages" 
ON public.campaign_messages
FOR ALL
TO authenticated
USING (
    campaign_id IN (
        SELECT id FROM public.campaigns WHERE organization_id IN (
            SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
        ) OR (public.has_role(auth.uid(), 'admin'))
    )
);

CREATE POLICY "Users can manage their organization's campaign contacts" 
ON public.campaign_contacts
FOR ALL
TO authenticated
USING (
    campaign_id IN (
        SELECT id FROM public.campaigns WHERE organization_id IN (
            SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
        ) OR (public.has_role(auth.uid(), 'admin'))
    )
);
