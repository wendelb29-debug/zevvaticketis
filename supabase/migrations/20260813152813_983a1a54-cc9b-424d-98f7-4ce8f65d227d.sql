ALTER TABLE public.whatsapp_instances 
ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.tenants(id);

-- Se houver apenas um tenant por enquanto, podemos associar as instâncias órfãs a ele
-- Mas o ideal é deixar como opcional ou preencher manualmente.

GRANT SELECT, INSERT, UPDATE, DELETE ON public.whatsapp_instances TO authenticated;
GRANT ALL ON public.whatsapp_instances TO service_role;

-- Adicionar política RLS para whatsapp_instances
ALTER TABLE public.whatsapp_instances ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Tenant isolation for instances" ON public.whatsapp_instances;
CREATE POLICY "Tenant isolation for instances" ON public.whatsapp_instances
FOR ALL TO authenticated
USING (tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()));
