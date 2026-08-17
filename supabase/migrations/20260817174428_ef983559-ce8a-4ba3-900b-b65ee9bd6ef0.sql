-- Fix security warnings for process_ticket_checkin
-- Revoke all permissions first
REVOKE ALL ON FUNCTION public.process_ticket_checkin(text, uuid, uuid, uuid) FROM public;
REVOKE ALL ON FUNCTION public.process_ticket_checkin(text, uuid, uuid, uuid) FROM anon;

-- Grant execute only to authenticated users
GRANT EXECUTE ON FUNCTION public.process_ticket_checkin(text, uuid, uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.process_ticket_checkin(text, uuid, uuid, uuid) TO service_role;
