-- 1. Políticas para tabelas de CRM (Garantindo reconhecimento pelo linter)
DROP POLICY IF EXISTS "Tenant isolation for contacts" ON public.whatsapp_contacts;
CREATE POLICY "Tenant isolation for contacts" ON public.whatsapp_contacts
FOR ALL TO authenticated
USING (tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Tenant isolation for groups" ON public.whatsapp_contact_groups;
CREATE POLICY "Tenant isolation for groups" ON public.whatsapp_contact_groups
FOR ALL TO authenticated
USING (tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Tenant isolation for group memberships" ON public.whatsapp_contact_group_memberships;
CREATE POLICY "Tenant isolation for group memberships" ON public.whatsapp_contact_group_memberships
FOR ALL TO authenticated
USING (tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Tenant isolation for attendances" ON public.whatsapp_attendances;
CREATE POLICY "Tenant isolation for attendances" ON public.whatsapp_attendances
FOR ALL TO authenticated
USING (tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Tenant isolation for attendance_events" ON public.attendance_events;
CREATE POLICY "Tenant isolation for attendance_events" ON public.attendance_events
FOR ALL TO authenticated
USING (tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()));

-- 2. Políticas para tabelas órfãs identificadas pelo linter
-- ticket_types
DROP POLICY IF EXISTS "Tenant isolation for ticket_types" ON public.ticket_types;
CREATE POLICY "Tenant isolation for ticket_types" ON public.ticket_types
FOR ALL TO authenticated
USING (event_id IN (SELECT id FROM events WHERE tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid())));

-- trip_itinerary_days
DROP POLICY IF EXISTS "Tenant isolation for trip_itinerary_days" ON public.trip_itinerary_days;
CREATE POLICY "Tenant isolation for trip_itinerary_days" ON public.trip_itinerary_days
FOR ALL TO authenticated
USING (ticket_type_id IN (SELECT id FROM ticket_types WHERE event_id IN (SELECT id FROM events WHERE tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()))));

-- trip_hotels
DROP POLICY IF EXISTS "Tenant isolation for trip_hotels" ON public.trip_hotels;
CREATE POLICY "Tenant isolation for trip_hotels" ON public.trip_hotels
FOR ALL TO authenticated
USING (ticket_type_id IN (SELECT id FROM ticket_types WHERE event_id IN (SELECT id FROM events WHERE tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()))));

-- trip_cost_items
DROP POLICY IF EXISTS "Tenant isolation for trip_cost_items" ON public.trip_cost_items;
CREATE POLICY "Tenant isolation for trip_cost_items" ON public.trip_cost_items
FOR ALL TO authenticated
USING (ticket_type_id IN (SELECT id FROM ticket_types WHERE event_id IN (SELECT id FROM events WHERE tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()))));

-- Adicionar permissões de leitura pública para tickets se necessário (opcional, mas comum)
CREATE POLICY "Public read for ticket_types" ON public.ticket_types FOR SELECT TO anon, authenticated USING (true);
