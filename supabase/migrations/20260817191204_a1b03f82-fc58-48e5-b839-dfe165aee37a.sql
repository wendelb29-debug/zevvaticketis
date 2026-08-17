REVOKE EXECUTE ON FUNCTION public.process_ticket_checkin(text, uuid, uuid, uuid) FROM public;
REVOKE EXECUTE ON FUNCTION public.process_ticket_checkin(text, uuid, uuid, uuid) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.process_ticket_checkin(text, uuid, uuid, uuid) FROM anon;

GRANT EXECUTE ON FUNCTION public.process_ticket_checkin(text, uuid, uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.process_ticket_checkin(text, uuid, uuid, uuid) TO service_role;
