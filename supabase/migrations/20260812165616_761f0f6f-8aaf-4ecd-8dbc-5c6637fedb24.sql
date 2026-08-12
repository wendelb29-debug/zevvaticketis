-- 1) Protect billing/plan fields on tenants
CREATE OR REPLACE FUNCTION public.prevent_tenant_billing_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF public.is_platform_admin() THEN
    RETURN NEW;
  END IF;

  IF NEW.taxa_percentual_custom IS DISTINCT FROM OLD.taxa_percentual_custom
     OR NEW.plan_id IS DISTINCT FROM OLD.plan_id
     OR NEW.plan IS DISTINCT FROM OLD.plan
     OR NEW.stripe_account_id IS DISTINCT FROM OLD.stripe_account_id
     OR NEW.status IS DISTINCT FROM OLD.status THEN
    RAISE EXCEPTION 'Alteração de campos financeiros/plano não permitida.';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_tenant_billing_change ON public.tenants;
CREATE TRIGGER trg_prevent_tenant_billing_change
BEFORE UPDATE ON public.tenants
FOR EACH ROW EXECUTE FUNCTION public.prevent_tenant_billing_change();

-- 2) Consolidate tenant-scoping policies

-- tenants (SELECT duplicates)
DROP POLICY IF EXISTS "Members can read their organizations" ON public.tenants;
DROP POLICY IF EXISTS "Members can view their organization" ON public.tenants;
DROP POLICY IF EXISTS "Members can read their tenants" ON public.tenants;
CREATE POLICY "Tenant read access" ON public.tenants
FOR SELECT TO authenticated
USING (id IN (SELECT public.get_user_tenants()) OR public.is_platform_admin());

-- events
DROP POLICY IF EXISTS "Producers can manage their own events" ON public.events;
DROP POLICY IF EXISTS "Tenant isolation" ON public.events;
DROP POLICY IF EXISTS "Tenant isolation for events" ON public.events;
DROP POLICY IF EXISTS "Public can view published events" ON public.events;
CREATE POLICY "Tenant isolation for events" ON public.events
FOR ALL TO authenticated
USING (tenant_id IN (SELECT public.get_user_tenants()) OR public.is_platform_admin())
WITH CHECK (tenant_id IN (SELECT public.get_user_tenants()) OR public.is_platform_admin());

-- orders
DROP POLICY IF EXISTS "Owners can read organization orders" ON public.orders;
DROP POLICY IF EXISTS "Tenant isolation" ON public.orders;
DROP POLICY IF EXISTS "Tenant isolation for orders" ON public.orders;
CREATE POLICY "Tenant isolation for orders" ON public.orders
FOR ALL TO authenticated
USING (tenant_id IN (SELECT public.get_user_tenants()) OR public.is_platform_admin())
WITH CHECK (tenant_id IN (SELECT public.get_user_tenants()) OR public.is_platform_admin());

-- tickets
DROP POLICY IF EXISTS "Producers can CRUD tickets for their own events" ON public.tickets;
DROP POLICY IF EXISTS "Tenant isolation" ON public.tickets;
DROP POLICY IF EXISTS "Tenant isolation for tickets" ON public.tickets;
CREATE POLICY "Tenant isolation for tickets" ON public.tickets
FOR ALL TO authenticated
USING (tenant_id IN (SELECT public.get_user_tenants()) OR public.is_platform_admin())
WITH CHECK (tenant_id IN (SELECT public.get_user_tenants()) OR public.is_platform_admin());

-- campaigns
DROP POLICY IF EXISTS "Admins and org members can manage campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Tenant isolation" ON public.campaigns;
DROP POLICY IF EXISTS "Users can view their own tenant campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Tenant isolation for campaigns" ON public.campaigns;
CREATE POLICY "Tenant isolation for campaigns" ON public.campaigns
FOR ALL TO authenticated
USING (tenant_id IN (SELECT public.get_user_tenants()) OR public.is_platform_admin())
WITH CHECK (tenant_id IN (SELECT public.get_user_tenants()) OR public.is_platform_admin());

-- ads
DROP POLICY IF EXISTS "Admins and org members can manage ads" ON public.ads;
DROP POLICY IF EXISTS "Tenant isolation" ON public.ads;
DROP POLICY IF EXISTS "Users can view their own tenant ads" ON public.ads;
DROP POLICY IF EXISTS "Tenant isolation for ads" ON public.ads;
CREATE POLICY "Tenant isolation for ads" ON public.ads
FOR ALL TO authenticated
USING (tenant_id IN (SELECT public.get_user_tenants()) OR public.is_platform_admin())
WITH CHECK (tenant_id IN (SELECT public.get_user_tenants()) OR public.is_platform_admin());

-- email_logs
DROP POLICY IF EXISTS "Admins can see all logs" ON public.email_logs;
DROP POLICY IF EXISTS "Producers can see their logs" ON public.email_logs;
DROP POLICY IF EXISTS "Tenant isolation" ON public.email_logs;
DROP POLICY IF EXISTS "Tenant isolation for email_logs" ON public.email_logs;
CREATE POLICY "Tenant isolation for email_logs" ON public.email_logs
FOR ALL TO authenticated
USING (tenant_id IN (SELECT public.get_user_tenants()) OR public.is_platform_admin())
WITH CHECK (tenant_id IN (SELECT public.get_user_tenants()) OR public.is_platform_admin());

-- email_templates
DROP POLICY IF EXISTS "Admins can see all templates" ON public.email_templates;
DROP POLICY IF EXISTS "Producers can see their templates" ON public.email_templates;
DROP POLICY IF EXISTS "Tenant isolation" ON public.email_templates;
DROP POLICY IF EXISTS "Tenant isolation for email_templates" ON public.email_templates;
CREATE POLICY "Tenant isolation for email_templates" ON public.email_templates
FOR ALL TO authenticated
USING (
  tenant_id IN (SELECT public.get_user_tenants())
  OR owner_id = auth.uid()
  OR public.is_platform_admin()
)
WITH CHECK (
  tenant_id IN (SELECT public.get_user_tenants())
  OR owner_id = auth.uid()
  OR public.is_platform_admin()
);

-- checkin_records
DROP POLICY IF EXISTS "Tenant isolation" ON public.checkin_records;
DROP POLICY IF EXISTS "Tenant isolation for checkin_records" ON public.checkin_records;
DROP POLICY IF EXISTS "Staff can insert checkin records for their event" ON public.checkin_records;
DROP POLICY IF EXISTS "Staff can view checkin records for their event" ON public.checkin_records;
CREATE POLICY "Tenant isolation for checkin_records" ON public.checkin_records
FOR ALL TO authenticated
USING (
  tenant_id IN (SELECT public.get_user_tenants())
  OR public.is_event_staff(auth.uid(), event_id)
  OR public.is_platform_admin()
)
WITH CHECK (
  tenant_id IN (SELECT public.get_user_tenants())
  OR public.is_event_staff(auth.uid(), event_id)
  OR public.is_platform_admin()
);

-- push_automations
DROP POLICY IF EXISTS "Admins can manage push automations" ON public.push_automations;
DROP POLICY IF EXISTS "Tenant isolation for push_automations" ON public.push_automations;
CREATE POLICY "Tenant isolation for push_automations" ON public.push_automations
FOR ALL TO authenticated
USING (tenant_id IN (SELECT public.get_user_tenants()) OR public.is_platform_admin())
WITH CHECK (tenant_id IN (SELECT public.get_user_tenants()) OR public.is_platform_admin());