-- Policies for tickets table to ensure proper isolation and RBAC

-- 1. Producer isolation: Can only see/manage tickets within their own tenant
-- Assumes organization membership is verified via tenant_id check in RLS
DROP POLICY IF EXISTS "Producers can view their own tenant tickets" ON public.tickets;
CREATE POLICY "Producers can view their own tenant tickets"
ON public.tickets
FOR SELECT
TO authenticated
USING (
  tenant_id IN (
    SELECT tenant_id FROM public.tenant_members WHERE user_id = auth.uid()
  )
);

-- 2. Platform Admin: Can view and manage all tickets if they have the global role
-- Using the existing has_role or platform_admin check logic
DROP POLICY IF EXISTS "Platform admins can view all tickets" ON public.tickets;
CREATE POLICY "Platform admins can view all tickets"
ON public.tickets
FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') -- This should be mapped to the platform admin check if separate
  OR EXISTS (SELECT 1 FROM public.platform_admins WHERE id = auth.uid())
);

-- 3. Participant isolation: Can only see their own tickets
DROP POLICY IF EXISTS "Participants can view their own tickets" ON public.tickets;
CREATE POLICY "Participants can view their own tickets"
ON public.tickets
FOR SELECT
TO authenticated
USING (
  buyer_id = auth.uid() OR owner_id = auth.uid()
);

-- 4. Audit Table (if not exists, create it for tracking critical actions)
CREATE TABLE IF NOT EXISTS public.ticket_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID REFERENCES public.tickets(id),
    action TEXT NOT NULL,
    performed_by UUID REFERENCES auth.users(id),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

GRANT SELECT, INSERT ON public.ticket_audit_logs TO authenticated;
GRANT ALL ON public.ticket_audit_logs TO service_role;

ALTER TABLE public.ticket_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Platform admins can see all audit logs"
ON public.ticket_audit_logs
FOR SELECT
TO authenticated
USING (EXISTS (SELECT 1 FROM public.platform_admins WHERE id = auth.uid()));

CREATE POLICY "Producers can see their own tenant audit logs"
ON public.ticket_audit_logs
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.tickets t
    WHERE t.id = ticket_id
    AND t.tenant_id IN (SELECT tenant_id FROM public.tenant_members WHERE user_id = auth.uid())
  )
);

-- Ensure token_hash is not exposed in common views if needed (already handled in code)
