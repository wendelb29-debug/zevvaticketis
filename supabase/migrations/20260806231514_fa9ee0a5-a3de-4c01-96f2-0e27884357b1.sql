-- Create WhatsApp Integrations table
CREATE TABLE public.whatsapp_integrations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id uuid NOT NULL,
    provider text NOT NULL DEFAULT 'meta',
    phone_number text,
    business_id text,
    access_token text,
    webhook_url text,
    verify_token text,
    status text DEFAULT 'waiting',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create Webhook Events table
CREATE TABLE public.whatsapp_webhook_events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    integration_id uuid REFERENCES public.whatsapp_integrations(id) ON DELETE CASCADE,
    event_type text NOT NULL,
    payload jsonb DEFAULT '{}',
    status text DEFAULT 'pending',
    created_at timestamptz DEFAULT now()
);

-- Create API Logs table
CREATE TABLE public.whatsapp_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    integration_id uuid REFERENCES public.whatsapp_integrations(id) ON DELETE CASCADE,
    action text NOT NULL,
    response jsonb DEFAULT '{}',
    created_at timestamptz DEFAULT now()
);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.whatsapp_integrations TO authenticated;
GRANT ALL ON public.whatsapp_integrations TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.whatsapp_webhook_events TO authenticated;
GRANT ALL ON public.whatsapp_webhook_events TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.whatsapp_logs TO authenticated;
GRANT ALL ON public.whatsapp_logs TO service_role;

-- Enable RLS
ALTER TABLE public.whatsapp_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_logs ENABLE ROW LEVEL SECURITY;

-- Create policies (Simplifying for authenticated access - in real scenario would filter by project_id)
CREATE POLICY "Authenticated users can manage integrations" ON public.whatsapp_integrations
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can view events" ON public.whatsapp_webhook_events
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can view logs" ON public.whatsapp_logs
    FOR ALL TO authenticated USING (true) WITH CHECK (true);
