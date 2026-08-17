CREATE TABLE IF NOT EXISTS public.platform_settings (
    section TEXT PRIMARY KEY,
    settings JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT now(),
    updated_by UUID REFERENCES auth.users(id)
);

-- Security
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.platform_settings TO authenticated;
GRANT ALL ON public.platform_settings TO service_role;

-- Only platform admins can see all settings, others might see non-sensitive ones
CREATE POLICY "Platform admins can manage settings"
ON public.platform_settings
FOR ALL
TO authenticated
USING (public.has_permission(auth.uid(), 'master.manage_global_settings'::public.app_permission_name));

