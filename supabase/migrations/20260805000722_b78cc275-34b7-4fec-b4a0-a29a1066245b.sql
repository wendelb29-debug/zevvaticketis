-- Revogar execução pública
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, text) FROM anon;

-- Apenas usuários autenticados e service_role podem executar
GRANT EXECUTE ON FUNCTION public.has_role(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, text) TO service_role;
