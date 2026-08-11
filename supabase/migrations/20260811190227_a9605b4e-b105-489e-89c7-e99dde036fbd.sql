-- Drop and recreate to match requested schema
DROP TABLE IF EXISTS public.email_logs CASCADE;
DROP TABLE IF EXISTS public.email_templates CASCADE;

-- Email Templates Table
CREATE TABLE public.email_templates (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    event_id uuid REFERENCES public.events(id) ON DELETE CASCADE,
    name text NOT NULL,
    category text NOT NULL,
    subject text NOT NULL,
    body_html text NOT NULL,
    body_text text,
    variables jsonb DEFAULT '[]',
    status text DEFAULT 'active',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Email Logs Table
CREATE TABLE public.email_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id uuid REFERENCES public.events(id) ON DELETE CASCADE,
    ticket_id uuid REFERENCES public.tickets(id) ON DELETE SET NULL,
    user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    template_id uuid REFERENCES public.email_templates(id) ON DELETE SET NULL,
    operator_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    email text NOT NULL,
    subject text NOT NULL,
    status text NOT NULL,
    sent_at timestamptz DEFAULT now(),
    opened_at timestamptz,
    failed_reason text,
    metadata jsonb DEFAULT '{}',
    created_at timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

GRANT ALL ON public.email_templates TO authenticated;
GRANT ALL ON public.email_templates TO service_role;
GRANT ALL ON public.email_logs TO authenticated;
GRANT ALL ON public.email_logs TO service_role;

-- Policies
CREATE POLICY "Admins can see all templates" ON public.email_templates FOR ALL TO authenticated USING (public.check_is_platform_admin(auth.uid()));
CREATE POLICY "Producers can see their templates" ON public.email_templates FOR ALL TO authenticated USING (owner_id = auth.uid() OR event_id IN (SELECT id FROM public.events WHERE producer_id = auth.uid()));

CREATE POLICY "Admins can see all logs" ON public.email_logs FOR ALL TO authenticated USING (public.check_is_platform_admin(auth.uid()));
CREATE POLICY "Producers can see their logs" ON public.email_logs FOR ALL TO authenticated USING (event_id IN (SELECT id FROM public.events WHERE producer_id = auth.uid()));
