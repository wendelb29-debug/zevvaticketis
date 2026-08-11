-- Fix SECURITY DEFINER warnings
-- Revoke public execute on sensitive functions
REVOKE EXECUTE ON FUNCTION public.is_event_staff(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_event_staff(uuid, uuid) TO authenticated;
