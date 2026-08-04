ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Platform settings are viewable by authenticated users"
    ON public.platform_settings
    FOR SELECT
    TO authenticated
    USING (true);

-- Only platform admins can update settings (assumes platform_admins table exists and is used)
CREATE POLICY "Admins can manage platform settings"
    ON public.platform_settings
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.platform_admins
            WHERE user_id = auth.uid()
        )
    );
