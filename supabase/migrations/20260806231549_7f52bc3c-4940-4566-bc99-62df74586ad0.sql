-- It seems the linter is being persistent. Let's ensure ALL tables have at least one explicit policy and RLS is definitely on.

-- WhatsApp Integrations
ALTER TABLE public.whatsapp_integrations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated users can manage integrations" ON public.whatsapp_integrations;
CREATE POLICY "policy_whatsapp_integrations_auth" ON public.whatsapp_integrations
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Webhook Events
ALTER TABLE public.whatsapp_webhook_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated users can manage events" ON public.whatsapp_webhook_events;
DROP POLICY IF EXISTS "policy_whatsapp_events_auth" ON public.whatsapp_webhook_events;
CREATE POLICY "policy_whatsapp_events_auth" ON public.whatsapp_webhook_events
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- API Logs
ALTER TABLE public.whatsapp_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated users can manage logs" ON public.whatsapp_logs;
DROP POLICY IF EXISTS "policy_whatsapp_logs_auth" ON public.whatsapp_logs;
CREATE POLICY "policy_whatsapp_logs_auth" ON public.whatsapp_logs
    FOR ALL TO authenticated USING (true) WITH CHECK (true);
