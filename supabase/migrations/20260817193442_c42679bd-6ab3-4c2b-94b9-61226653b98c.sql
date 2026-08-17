ALTER VIEW public.ad_campaigns_public SET (security_invoker = on);

-- Column-level grant: anon can only read non-financial columns of the base table
REVOKE ALL ON public.ad_campaigns FROM anon;
GRANT SELECT (id, organization_id, advertiser_id, name, priority, start_at, end_at, timezone, targeting, frequency_cap)
  ON public.ad_campaigns TO anon;

CREATE POLICY "Anon can read active campaign basics"
  ON public.ad_campaigns FOR SELECT TO anon
  USING (status = 'ativa' AND start_at <= now() AND end_at >= now());