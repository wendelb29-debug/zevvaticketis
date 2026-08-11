-- Create CHECKIN_RECORDS table
CREATE TABLE IF NOT EXISTS public.checkin_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    operator_id UUID NOT NULL REFERENCES auth.users(id),
    checkin_date DATE DEFAULT CURRENT_DATE,
    checkin_time TIME DEFAULT CURRENT_TIME,
    status TEXT NOT NULL DEFAULT 'completed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create TICKET_TRACKING table (for attribution)
CREATE TABLE IF NOT EXISTS public.ticket_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
    campaign_id UUID,
    ad_id UUID,
    source TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create EVENT_STAFF table (for check-in operators)
CREATE TABLE IF NOT EXISTS public.event_staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    permission TEXT NOT NULL CHECK (permission IN ('ADMIN', 'SUPERVISOR', 'OPERADOR')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(event_id, user_id)
);

-- Enable RLS
ALTER TABLE public.checkin_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_staff ENABLE ROW LEVEL SECURITY;

-- Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.checkin_records TO authenticated;
GRANT ALL ON public.checkin_records TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.ticket_tracking TO authenticated;
GRANT ALL ON public.ticket_tracking TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.event_staff TO authenticated;
GRANT ALL ON public.event_staff TO service_role;

-- Policies
CREATE POLICY "Staff can see records for their events"
ON public.checkin_records FOR SELECT TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.event_staff WHERE event_id = checkin_records.event_id AND user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM public.platform_admins WHERE user_id = auth.uid())
);

CREATE POLICY "Staff can insert checkin records"
ON public.checkin_records FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (SELECT 1 FROM public.event_staff WHERE event_id = checkin_records.event_id AND user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM public.platform_admins WHERE user_id = auth.uid())
);

CREATE POLICY "Anyone with platform admin can see tracking"
ON public.ticket_tracking FOR SELECT TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.platform_admins WHERE user_id = auth.uid())
);

CREATE POLICY "Staff can see staff assignments"
ON public.event_staff FOR SELECT TO authenticated
USING (
  event_id IN (SELECT event_id FROM public.event_staff WHERE user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM public.platform_admins WHERE user_id = auth.uid())
);
