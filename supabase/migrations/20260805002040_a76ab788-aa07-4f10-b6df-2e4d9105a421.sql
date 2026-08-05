
-- Fix RLS for whatsapp_webhook_errors
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can delete webhook errors') THEN
        CREATE POLICY "Admins can delete webhook errors" ON public.whatsapp_webhook_errors
            FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
    END IF;
END $$;

-- Revoke all public/authenticated execute on sensitive functions
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO service_role;

-- Allow authenticated users to USE the function via policies, but not call it directly if possible
-- (Actually, policies run as the user, so they NEED EXECUTE permission if the policy uses the function)
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

-- If there are other security definer functions, we'd do the same.
-- The linter often flags functions in public schema.
