-- The previous migration might have had an issue with policy names or table identification in the linter
-- Re-applying explicit policies for all tables to ensure they are properly registered

DROP POLICY IF EXISTS "Authenticated users can view events" ON public.whatsapp_webhook_events;
CREATE POLICY "Authenticated users can manage events" ON public.whatsapp_webhook_events
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can view logs" ON public.whatsapp_logs;
CREATE POLICY "Authenticated users can manage logs" ON public.whatsapp_logs
    FOR ALL TO authenticated USING (true) WITH CHECK (true);
