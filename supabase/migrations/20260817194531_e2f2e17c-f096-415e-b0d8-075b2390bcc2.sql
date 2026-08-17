-- Hardened RLS for tickets
DROP POLICY IF EXISTS "Producers can view their own tenant tickets" ON public.tickets;
CREATE POLICY "Producers can view their own tenant tickets"
ON public.tickets
FOR SELECT
TO authenticated
USING (
  tenant_id IN (
    SELECT tm.tenant_id FROM public.tenant_members tm WHERE tm.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Platform admins can view all tickets" ON public.tickets;
CREATE POLICY "Platform admins can view all tickets"
ON public.tickets
FOR ALL
TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.platform_admins WHERE id = auth.uid())
);

DROP POLICY IF EXISTS "Participants can view their own tickets" ON public.tickets;
CREATE POLICY "Participants can view their own tickets"
ON public.tickets
FOR SELECT
TO authenticated
USING (
  owner_id = auth.uid()
);

-- Audit System
CREATE TABLE IF NOT EXISTS public.ticket_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID REFERENCES public.tickets(id) ON DELETE CASCADE,
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
    AND t.tenant_id IN (SELECT tm.tenant_id FROM public.tenant_members tm WHERE tm.user_id = auth.uid())
  )
);
