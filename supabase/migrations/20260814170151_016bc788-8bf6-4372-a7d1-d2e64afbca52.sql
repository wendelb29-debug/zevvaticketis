-- Revoga acesso público às funções SECURITY DEFINER criadas
REVOKE EXECUTE ON FUNCTION public.check_user_is_admin(uuid) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.check_user_is_admin(uuid) TO service_role;

REVOKE EXECUTE ON FUNCTION public.reserve_tickets(uuid, int) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.reserve_tickets(uuid, int) TO service_role;
