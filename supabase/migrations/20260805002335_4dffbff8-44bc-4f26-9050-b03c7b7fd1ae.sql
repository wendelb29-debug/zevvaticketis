
-- Tablas para integración de Gmail (basado en Accord)

CREATE TABLE IF NOT EXISTS public.email_accounts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    provider text DEFAULT 'gmail' CHECK (provider = 'gmail'),
    display_name text,
    email_address text,
    status text CHECK (status IN ('pending','connected','error','disconnected')),
    status_message text,
    oauth_tokens jsonb,
    last_synced_at timestamptz,
    created_at timestamptz DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.email_accounts TO authenticated;
GRANT ALL ON public.email_accounts TO service_role;
ALTER TABLE public.email_accounts ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can manage email_accounts') THEN
        CREATE POLICY "Admins can manage email_accounts" ON public.email_accounts
            FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.email_messages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id uuid REFERENCES public.email_accounts(id) ON DELETE CASCADE NOT NULL,
    provider_msg_id text,
    thread_id text,
    folder text CHECK (folder IN ('inbox','sent','important','spam','trash','archive')),
    from_email text,
    from_name text,
    to_emails jsonb,
    cc_emails jsonb,
    subject text,
    snippet text,
    body_text text,
    body_html text,
    is_read boolean DEFAULT false,
    is_starred boolean DEFAULT false,
    has_attachments boolean DEFAULT false,
    received_at timestamptz,
    attachments jsonb,
    created_at timestamptz DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.email_messages TO authenticated;
GRANT ALL ON public.email_messages TO service_role;
ALTER TABLE public.email_messages ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can manage email_messages') THEN
        CREATE POLICY "Admins can manage email_messages" ON public.email_messages
            FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
    END IF;
END $$;
