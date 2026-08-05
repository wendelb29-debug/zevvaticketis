-- 1. Create email_integrations table for individual connections
CREATE TABLE public.email_integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    provider TEXT NOT NULL DEFAULT 'google',
    email_address TEXT NOT NULL,
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    expires_at TIMESTAMPTZ,
    photo_url TEXT,
    display_name TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (user_id, email_address)
);

-- 2. Enable RLS and Grant permissions
ALTER TABLE public.email_integrations ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.email_integrations TO authenticated;
GRANT ALL ON public.email_integrations TO service_role;

-- 3. RLS Policy: Users can only see/manage their own integrations
CREATE POLICY "Users can manage their own email integrations"
ON public.email_integrations
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 4. Create email_messages_individual table to store messages per integration
CREATE TABLE public.email_messages_individual (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    integration_id UUID REFERENCES public.email_integrations(id) ON DELETE CASCADE NOT NULL,
    gmail_message_id TEXT,
    thread_id TEXT,
    from_name TEXT,
    from_email TEXT NOT NULL,
    to_emails TEXT[] NOT NULL,
    subject TEXT,
    snippet TEXT,
    body_text TEXT,
    body_html TEXT,
    received_at TIMESTAMPTZ,
    is_read BOOLEAN DEFAULT false,
    is_starred BOOLEAN DEFAULT false,
    folder TEXT DEFAULT 'inbox',
    labels TEXT[],
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.email_messages_individual ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.email_messages_individual TO authenticated;
GRANT ALL ON public.email_messages_individual TO service_role;

CREATE POLICY "Users can see messages from their own integrations"
ON public.email_messages_individual
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.email_integrations
        WHERE id = public.email_messages_individual.integration_id
        AND user_id = auth.uid()
    )
);
