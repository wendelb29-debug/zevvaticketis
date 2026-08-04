-- Add destaque column to events if it doesn't exist
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS destaque boolean DEFAULT false;

-- Create event_favorites table
CREATE TABLE IF NOT EXISTS public.event_favorites (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    event_id uuid REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
    created_at timestamptz DEFAULT now(),
    UNIQUE(user_id, event_id)
);

-- Grant access
GRANT SELECT, INSERT, DELETE ON public.event_favorites TO authenticated;
GRANT ALL ON public.event_favorites TO service_role;

-- Enable RLS
ALTER TABLE public.event_favorites ENABLE ROW LEVEL SECURITY;

-- RLS policies
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage their own favorites' AND tablename = 'event_favorites'
    ) THEN
        CREATE POLICY "Users can manage their own favorites" 
        ON public.event_favorites 
        FOR ALL 
        TO authenticated 
        USING (auth.uid() = user_id) 
        WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;
