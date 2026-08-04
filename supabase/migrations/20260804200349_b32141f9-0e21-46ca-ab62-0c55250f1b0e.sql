-- Secure the handle_new_user function
ALTER FUNCTION public.handle_new_user() SET search_path = public;

-- Revoke execute from public roles to prevent manual calls
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM public;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon;
