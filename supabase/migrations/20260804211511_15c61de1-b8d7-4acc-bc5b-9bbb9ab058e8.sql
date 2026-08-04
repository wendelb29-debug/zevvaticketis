-- 1. Align events table
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id);

-- 2. Migrate existing data if any (assuming producer_id user belongs to one organization)
UPDATE public.events e
SET organization_id = (
    SELECT organization_id 
    FROM public.organization_members m 
    WHERE m.user_id = e.producer_id 
    LIMIT 1
)
WHERE organization_id IS NULL;

-- 3. Fix RLS for events
DROP POLICY IF EXISTS "Producers can CRUD their own events" ON public.events;
CREATE POLICY "Members can manage events" ON public.events FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.organization_members m WHERE m.organization_id = events.organization_id AND m.user_id = auth.uid()));

-- 4. Re-apply policies for ticket and trip tables with correct organization_id reference
DROP POLICY IF EXISTS "Owners can manage ticket types" ON public.ticket_types;
CREATE POLICY "Owners can manage ticket types" ON public.ticket_types FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.organization_members m JOIN public.events e ON e.organization_id = m.organization_id WHERE e.id = ticket_types.event_id AND m.user_id = auth.uid()));

DROP POLICY IF EXISTS "Owners can manage trip itinerary" ON public.trip_itinerary_days;
CREATE POLICY "Owners can manage trip itinerary" ON public.trip_itinerary_days FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.organization_members m JOIN public.ticket_types t ON t.id = trip_itinerary_days.ticket_type_id JOIN public.events e ON e.id = t.event_id WHERE e.organization_id = m.organization_id AND m.user_id = auth.uid()));

DROP POLICY IF EXISTS "Owners can manage trip hotels" ON public.trip_hotels;
CREATE POLICY "Owners can manage trip hotels" ON public.trip_hotels FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.organization_members m JOIN public.ticket_types t ON t.id = trip_hotels.ticket_type_id JOIN public.events e ON e.id = t.event_id WHERE e.organization_id = m.organization_id AND m.user_id = auth.uid()));

DROP POLICY IF EXISTS "Owners can manage trip costs" ON public.trip_cost_items;
CREATE POLICY "Owners can manage trip costs" ON public.trip_cost_items FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.organization_members m JOIN public.ticket_types t ON t.id = trip_cost_items.ticket_type_id JOIN public.events e ON e.id = t.event_id WHERE e.organization_id = m.organization_id AND m.user_id = auth.uid()));