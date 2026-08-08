-- Revoke public execute from log_resource_access to satisfy security linter
-- The function should still be executable by authenticated users as granted in the previous migration, 
-- but we remove any default public access if it was implicitly granted.
REVOKE ALL ON FUNCTION public.log_resource_access(text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.log_resource_access(text, text, text) TO authenticated;
-- We do not grant to 'anon' to prevent potential log spamming from unauthenticated users,
-- satisfying the WARN 3: Public Can Execute SECURITY DEFINER Function.
