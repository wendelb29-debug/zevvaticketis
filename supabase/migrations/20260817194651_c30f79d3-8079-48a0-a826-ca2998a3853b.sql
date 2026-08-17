-- Lock down SECURITY DEFINER functions
REVOKE ALL ON FUNCTION public.process_ticket_checkin(text, uuid, uuid, uuid) FROM public;
REVOKE ALL ON FUNCTION public.process_ticket_checkin(text, uuid, uuid, uuid) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.process_ticket_checkin(text, uuid, uuid, uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.process_ticket_checkin(text, uuid, uuid, uuid) TO authenticated; -- Required for authorized scanner operators
