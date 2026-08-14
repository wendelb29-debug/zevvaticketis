-- Fix columns in tracking table to match the frontend implementation
ALTER TABLE public.tracking 
RENAME COLUMN tipo_evento TO event_name;

ALTER TABLE public.tracking
ADD COLUMN IF NOT EXISTS url text,
ADD COLUMN IF NOT EXISTS utm_source text,
ADD COLUMN IF NOT EXISTS utm_medium text,
ADD COLUMN IF NOT EXISTS utm_campaign text,
ADD COLUMN IF NOT EXISTS utm_term text,
ADD COLUMN IF NOT EXISTS utm_content text;

-- Fix sales_attribution
ALTER TABLE public.sales_attribution
ADD COLUMN IF NOT EXISTS event_id uuid REFERENCES public.events(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS amount decimal(12,2),
ADD COLUMN IF NOT EXISTS channel text,
ADD COLUMN IF NOT EXISTS conversion_path text;

-- Add grants to be sure
GRANT SELECT, INSERT ON public.tracking TO anon, authenticated;
GRANT ALL ON public.tracking TO service_role;
