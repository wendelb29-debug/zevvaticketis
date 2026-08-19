-- 1) Server-only secret stores
CREATE TABLE IF NOT EXISTS public.email_account_secrets (
  account_id uuid PRIMARY KEY REFERENCES public.email_accounts(id) ON DELETE CASCADE,
  oauth_tokens jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.email_integration_secrets (
  integration_id uuid PRIMARY KEY REFERENCES public.email_integrations(id) ON DELETE CASCADE,
  access_token text,
  refresh_token text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.user_2fa_secrets (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  two_factor_secret text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

REVOKE ALL ON public.email_account_secrets FROM anon, authenticated;
REVOKE ALL ON public.email_integration_secrets FROM anon, authenticated;
REVOKE ALL ON public.user_2fa_secrets FROM anon, authenticated;
GRANT ALL ON public.email_account_secrets TO service_role;
GRANT ALL ON public.email_integration_secrets TO service_role;
GRANT ALL ON public.user_2fa_secrets TO service_role;

ALTER TABLE public.email_account_secrets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_integration_secrets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_2fa_secrets ENABLE ROW LEVEL SECURITY;

-- 2) Migrate any existing values (tables are empty today, kept for safety)
INSERT INTO public.email_account_secrets (account_id, oauth_tokens)
SELECT id, oauth_tokens FROM public.email_accounts WHERE oauth_tokens IS NOT NULL
ON CONFLICT (account_id) DO NOTHING;

INSERT INTO public.email_integration_secrets (integration_id, access_token, refresh_token)
SELECT id, access_token, refresh_token FROM public.email_integrations
WHERE access_token IS NOT NULL OR refresh_token IS NOT NULL
ON CONFLICT (integration_id) DO NOTHING;

INSERT INTO public.user_2fa_secrets (user_id, two_factor_secret)
SELECT id, two_factor_secret FROM public.profiles WHERE two_factor_secret IS NOT NULL
ON CONFLICT (user_id) DO NOTHING;

-- 3) Remove client-readable credential columns
ALTER TABLE public.email_accounts DROP COLUMN IF EXISTS oauth_tokens;
ALTER TABLE public.email_integrations DROP COLUMN IF EXISTS access_token;
ALTER TABLE public.email_integrations DROP COLUMN IF EXISTS refresh_token;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS two_factor_secret;

-- 4) SECURITY DEFINER function no longer callable by anon/authenticated
REVOKE ALL ON FUNCTION public.get_master_tenant_details(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_master_tenant_details(uuid) TO service_role;