CREATE POLICY "Enable insert for authenticated users" ON public.tenants FOR INSERT TO authenticated WITH CHECK (true);
GRANT INSERT ON public.tenants TO authenticated;
GRANT INSERT ON public.tenant_members TO authenticated;
