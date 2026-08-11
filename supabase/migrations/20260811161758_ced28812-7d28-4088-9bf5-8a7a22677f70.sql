-- Add featured column to events table
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS featured boolean DEFAULT false;

-- Add slug column to events table if it doesn't exist
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS slug text;

-- Create unique index on slug
CREATE UNIQUE INDEX IF NOT EXISTS events_slug_idx ON public.events (slug);

-- Ensure public access for published events
GRANT SELECT ON public.events TO anon;
GRANT SELECT ON public.events TO authenticated;

-- Seed some featured events using a subquery for cross-platform compatibility
UPDATE public.events 
SET featured = true 
WHERE id IN (
  SELECT id FROM public.events 
  WHERE status = 'publicado' 
  ORDER BY created_at DESC 
  LIMIT 3
);
