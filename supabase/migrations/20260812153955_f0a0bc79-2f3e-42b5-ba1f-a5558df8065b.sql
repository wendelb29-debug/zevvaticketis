DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.tenants;
REVOKE INSERT ON public.tenants FROM authenticated;
GRANT ALL ON public.tenants TO service_role;