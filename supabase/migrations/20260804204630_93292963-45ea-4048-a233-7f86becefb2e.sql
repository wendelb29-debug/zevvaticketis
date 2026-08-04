ALTER TABLE public.events ADD COLUMN IF NOT EXISTS min_price NUMERIC DEFAULT 0;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.events TO authenticated;
GRANT ALL ON public.events TO service_role;
GRANT SELECT ON public.events TO anon;