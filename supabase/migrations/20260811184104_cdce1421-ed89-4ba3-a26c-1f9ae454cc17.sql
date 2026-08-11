ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS share_token text UNIQUE;
GRANT SELECT, UPDATE ON public.tickets TO authenticated;
GRANT ALL ON public.tickets TO service_role;
