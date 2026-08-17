DROP POLICY IF EXISTS "Anyone can insert metrics" ON public.ad_metrics;

CREATE POLICY "Metrics only for active campaigns"
ON public.ad_metrics
FOR INSERT
TO anon, authenticated
WITH CHECK (
  event_type IN ('impression','click')
  AND EXISTS (
    SELECT 1
    FROM public.ad_creatives cr
    JOIN public.ad_campaigns c ON c.id = cr.campaign_id
    WHERE cr.id = ad_metrics.creative_id
      AND c.id = ad_metrics.campaign_id
      AND c.organization_id = ad_metrics.organization_id
      AND c.status = 'active'
      AND cr.status = 'active'
      AND now() BETWEEN c.start_at AND c.end_at
  )
);

CREATE POLICY "Users manage their own email accounts"
ON public.email_accounts
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());