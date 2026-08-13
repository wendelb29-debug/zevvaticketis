-- 1. Enum para idiomas suportados
DO $$ BEGIN
    CREATE TYPE public.supported_language AS ENUM ('pt-BR', 'en-US', 'es-ES');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Enum para temas
DO $$ BEGIN
    CREATE TYPE public.theme_preference AS ENUM ('light', 'dark', 'system');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Tabela de preferências padrão da conta
CREATE TABLE IF NOT EXISTS public.user_preferences (
    user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    default_language public.supported_language NOT NULL DEFAULT 'pt-BR',
    default_theme public.theme_preference NOT NULL DEFAULT 'system',
    default_font_size integer NOT NULL DEFAULT 100 CHECK (default_font_size >= 80 AND default_font_size <= 130),
    timezone text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- 4. Tabela de preferências específicas por dispositivo
CREATE TABLE IF NOT EXISTS public.user_device_preferences (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    device_id text NOT NULL,
    language public.supported_language NOT NULL,
    theme public.theme_preference NOT NULL,
    font_size integer NOT NULL DEFAULT 100 CHECK (font_size >= 80 AND font_size <= 130),
    timezone text,
    locale text,
    last_seen_at timestamptz NOT NULL DEFAULT now(),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE(user_id, device_id)
);

-- 5. Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_preferences TO authenticated;
GRANT ALL ON public.user_preferences TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_device_preferences TO authenticated;
GRANT ALL ON public.user_device_preferences TO service_role;

-- 6. RLS
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_device_preferences ENABLE ROW LEVEL SECURITY;

-- 7. Policies para user_preferences
CREATE POLICY "Users can manage their own account preferences"
    ON public.user_preferences
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 8. Policies para user_device_preferences
CREATE POLICY "Users can manage their own device preferences"
    ON public.user_device_preferences
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 9. Trigger para updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_user_preferences_updated_at
    BEFORE UPDATE ON public.user_preferences
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_user_device_preferences_updated_at
    BEFORE UPDATE ON public.user_device_preferences
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
