-- Migração emergencial para corrigir permissões e tabelas faltantes

-- 1. Redefinir lógica de admin com função única para evitar PGRST203
CREATE OR REPLACE FUNCTION public.check_is_platform_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.platform_admins
    WHERE user_id = _user_id
  );
$$;

GRANT EXECUTE ON FUNCTION public.check_is_platform_admin TO authenticated;

-- 2. Garantir push_automations
CREATE TABLE IF NOT EXISTS public.push_automations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    trigger_type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'paused',
    delay_time INTERVAL,
    audience TEXT NOT NULL DEFAULT 'all',
    title_template TEXT,
    message_template TEXT,
    button_text TEXT,
    action_url TEXT,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.push_automations TO authenticated;
GRANT ALL ON public.push_automations TO service_role;
ALTER TABLE public.push_automations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage push automations" ON public.push_automations;
CREATE POLICY "Admins can manage push automations" ON public.push_automations
    FOR ALL TO authenticated USING (public.check_is_platform_admin(auth.uid()));

-- 3. Garantir access_logs
CREATE TABLE IF NOT EXISTS public.access_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    resource_type text NOT NULL,
    resource_id text,
    action text NOT NULL DEFAULT 'view',
    ip_address text,
    user_agent text,
    created_at timestamptz DEFAULT now()
);

GRANT SELECT, INSERT ON public.access_logs TO authenticated;
GRANT ALL ON public.access_logs TO service_role;
ALTER TABLE public.access_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view all access logs" ON public.access_logs;
CREATE POLICY "Admins can view all access logs" ON public.access_logs
    FOR SELECT TO authenticated USING (public.check_is_platform_admin(auth.uid()));

DROP POLICY IF EXISTS "Authenticated can insert access logs" ON public.access_logs;
CREATE POLICY "Authenticated can insert access logs" ON public.access_logs
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = admin_id);

-- 4. Garantir grants em platform_admins
GRANT SELECT ON public.platform_admins TO authenticated;
GRANT ALL ON public.platform_admins TO service_role;

-- 5. Forçar Wendel como admin
INSERT INTO public.platform_admins (user_id)
VALUES ('101eccb0-32f3-4fa0-938f-827d36ee4380')
ON CONFLICT (user_id) DO NOTHING;

-- 6. Recarregar cache do esquema (através de regrant)
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;
