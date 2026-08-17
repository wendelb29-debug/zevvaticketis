ALTER VIEW public.ad_campaigns_public SET (security_invoker = on);
REVOKE ALL ON public.ad_campaigns_public FROM anon;
REVOKE ALL ON public.ad_creatives FROM anon;