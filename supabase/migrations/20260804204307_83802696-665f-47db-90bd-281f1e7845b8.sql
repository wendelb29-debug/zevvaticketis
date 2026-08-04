ALTER TABLE public.events ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS country_id TEXT;

-- Garantir que as permissões continuem valendo
GRANT SELECT, INSERT, UPDATE, DELETE ON public.events TO authenticated;
GRANT ALL ON public.events TO service_role;
GRANT SELECT ON public.events TO anon;