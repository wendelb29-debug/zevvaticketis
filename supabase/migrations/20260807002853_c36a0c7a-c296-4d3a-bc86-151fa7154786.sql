DROP POLICY IF EXISTS policy_whatsapp_integrations_auth ON public.whatsapp_integrations;
DROP POLICY IF EXISTS policy_whatsapp_logs_auth ON public.whatsapp_logs;
DROP POLICY IF EXISTS policy_whatsapp_events_auth ON public.whatsapp_webhook_events;

CREATE POLICY "Org members or admins manage whatsapp integrations"
ON public.whatsapp_integrations
FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
  OR EXISTS (
    SELECT 1 FROM public.organization_members m
    WHERE m.organization_id = whatsapp_integrations.project_id
      AND m.user_id = auth.uid()
  )
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin')
  OR EXISTS (
    SELECT 1 FROM public.organization_members m
    WHERE m.organization_id = whatsapp_integrations.project_id
      AND m.user_id = auth.uid()
  )
);

CREATE POLICY "Org members or admins manage whatsapp logs"
ON public.whatsapp_logs
FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
  OR EXISTS (
    SELECT 1
    FROM public.whatsapp_integrations i
    JOIN public.organization_members m ON m.organization_id = i.project_id
    WHERE i.id = whatsapp_logs.integration_id
      AND m.user_id = auth.uid()
  )
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin')
  OR EXISTS (
    SELECT 1
    FROM public.whatsapp_integrations i
    JOIN public.organization_members m ON m.organization_id = i.project_id
    WHERE i.id = whatsapp_logs.integration_id
      AND m.user_id = auth.uid()
  )
);

CREATE POLICY "Org members or admins manage whatsapp webhook events"
ON public.whatsapp_webhook_events
FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
  OR EXISTS (
    SELECT 1
    FROM public.whatsapp_integrations i
    JOIN public.organization_members m ON m.organization_id = i.project_id
    WHERE i.id = whatsapp_webhook_events.integration_id
      AND m.user_id = auth.uid()
  )
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin')
  OR EXISTS (
    SELECT 1
    FROM public.whatsapp_integrations i
    JOIN public.organization_members m ON m.organization_id = i.project_id
    WHERE i.id = whatsapp_webhook_events.integration_id
      AND m.user_id = auth.uid()
  )
);