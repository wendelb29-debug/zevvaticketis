
CREATE TABLE IF NOT EXISTS public.whatsapp_instances (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    nome text NOT NULL,
    uazapi_token text NOT NULL,
    status text DEFAULT 'active',
    created_at timestamptz DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.whatsapp_instances TO authenticated;
GRANT ALL ON public.whatsapp_instances TO service_role;
ALTER TABLE public.whatsapp_instances ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can manage whatsapp_instances') THEN
        CREATE POLICY "Admins can manage whatsapp_instances" ON public.whatsapp_instances
            FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.whatsapp_contacts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    phone text NOT NULL UNIQUE,
    name text,
    name_manually_edited boolean DEFAULT false,
    last_interaction_at timestamptz,
    organization_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL,
    created_at timestamptz DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.whatsapp_contacts TO authenticated;
GRANT ALL ON public.whatsapp_contacts TO service_role;
ALTER TABLE public.whatsapp_contacts ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can manage whatsapp_contacts') THEN
        CREATE POLICY "Admins can manage whatsapp_contacts" ON public.whatsapp_contacts
            FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.whatsapp_messages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    contact_id uuid REFERENCES public.whatsapp_contacts(id) ON DELETE CASCADE NOT NULL,
    direction text CHECK (direction IN ('inbound', 'outbound')) NOT NULL,
    content text,
    message_type text DEFAULT 'text',
    media_url text,
    status text,
    wa_message_id text,
    created_at timestamptz DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.whatsapp_messages TO authenticated;
GRANT ALL ON public.whatsapp_messages TO service_role;
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can manage whatsapp_messages') THEN
        CREATE POLICY "Admins can manage whatsapp_messages" ON public.whatsapp_messages
            FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.whatsapp_webhook_errors (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type text,
    error_message text,
    payload jsonb,
    created_at timestamptz DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.whatsapp_webhook_errors TO authenticated;
GRANT ALL ON public.whatsapp_webhook_errors TO service_role;
ALTER TABLE public.whatsapp_webhook_errors ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can view webhook errors') THEN
        CREATE POLICY "Admins can view webhook errors" ON public.whatsapp_webhook_errors
            FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
    END IF;
END $$;
