CREATE TABLE IF NOT EXISTS public.checkin_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id_ref uuid,
    ticket_id_ref uuid,
    operator_id_ref uuid,
    tenant_id_ref uuid,
    action_text text,
    created_at_ts timestamptz DEFAULT now()
);

GRANT SELECT, INSERT ON public.checkin_logs TO authenticated;
GRANT ALL ON public.checkin_logs TO service_role;
