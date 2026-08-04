DROP POLICY IF EXISTS "Public can read platform settings" ON public.platform_settings;

REVOKE ALL ON FUNCTION public.promote_to_platform_admin(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.promote_to_platform_admin(text) FROM anon;
REVOKE ALL ON FUNCTION public.promote_to_platform_admin(text) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.promote_to_platform_admin(text) TO service_role;