CREATE TABLE public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    producer_id UUID REFERENCES auth.users(id) NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    cover_image TEXT,
    event_type TEXT DEFAULT 'presencial',
    location TEXT,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    status TEXT DEFAULT 'rascunho',
    created_at TIMESTAMPTZ DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.events TO authenticated;
GRANT ALL ON public.events TO service_role;
GRANT SELECT ON public.events TO anon;

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Producers can CRUD their own events"
ON public.events
FOR ALL
TO authenticated
USING (auth.uid() = producer_id)
WITH CHECK (auth.uid() = producer_id);

CREATE POLICY "Public can view published events"
ON public.events
FOR SELECT
TO anon, authenticated
USING (status = 'publicado');

CREATE TABLE public.tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC NOT NULL DEFAULT 0,
    quantity INTEGER NOT NULL DEFAULT 0,
    sale_start TIMESTAMPTZ,
    sale_end TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.tickets TO authenticated;
GRANT ALL ON public.tickets TO service_role;
GRANT SELECT ON public.tickets TO anon;

ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Producers can CRUD tickets for their own events"
ON public.tickets
FOR ALL
TO authenticated
USING (EXISTS (
    SELECT 1 FROM public.events
    WHERE events.id = tickets.event_id
    AND events.producer_id = auth.uid()
));

CREATE POLICY "Public can view tickets for published events"
ON public.tickets
FOR SELECT
TO anon, authenticated
USING (EXISTS (
    SELECT 1 FROM public.events
    WHERE events.id = tickets.event_id
    AND events.status = 'publicado'
));