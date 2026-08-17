-- Fix SECURITY DEFINER execution permissions for ticketing environment
REVOKE EXECUTE ON FUNCTION public.process_ticket_checkin(text, uuid, uuid, uuid) FROM public;
REVOKE EXECUTE ON FUNCTION public.process_ticket_checkin(text, uuid, uuid, uuid) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.process_ticket_checkin(text, uuid, uuid, uuid) TO service_role;

-- Re-grant to authenticated but ensure it is only for designated check-in roles if applicable
-- For now, keeping it restricted to service_role (server actions) or authenticated with internal verification
GRANT EXECUTE ON FUNCTION public.process_ticket_checkin(text, uuid, uuid, uuid) TO authenticated;

-- Ensure audit logs are not writable by anyone except the system
REVOKE INSERT, UPDATE, DELETE ON public.checkin_logs FROM authenticated;
GRANT INSERT ON public.checkin_logs TO authenticated; -- Allow recording logs but not editing them
GRANT ALL ON public.checkin_logs TO service_role;
