-- 1. Create checkin_records table
CREATE TABLE IF NOT EXISTS public.checkin_records (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id uuid REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
    ticket_id uuid REFERENCES public.tickets(id) ON DELETE CASCADE NOT NULL,
    operator_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    checkin_date date DEFAULT current_date NOT NULL,
    checkin_time time DEFAULT current_time NOT NULL,
    status text DEFAULT 'presente' NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- 2. Create checkin_logs table
CREATE TABLE IF NOT EXISTS public.checkin_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id uuid REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
    operator_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    action text NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz DEFAULT now()
);

-- 3. Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.checkin_records TO authenticated;
GRANT ALL ON public.checkin_records TO service_role;
GRANT SELECT, INSERT ON public.checkin_logs TO authenticated;
GRANT ALL ON public.checkin_logs TO service_role;

-- 4. RLS
ALTER TABLE public.checkin_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkin_logs ENABLE ROW LEVEL SECURITY;

-- 5. Policies
CREATE POLICY "Staff can view checkin records for their event"
ON public.checkin_records FOR SELECT
TO authenticated
USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.is_event_staff(auth.uid(), event_id)
);

CREATE POLICY "Staff can insert checkin records for their event"
ON public.checkin_records FOR INSERT
TO authenticated
WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR 
    public.is_event_staff(auth.uid(), event_id)
);

CREATE POLICY "Staff can view logs for their event"
ON public.checkin_logs FOR SELECT
TO authenticated
USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.is_event_staff(auth.uid(), event_id)
);

CREATE POLICY "Staff can insert logs for their event"
ON public.checkin_logs FOR INSERT
TO authenticated
WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR 
    public.is_event_staff(auth.uid(), event_id)
);
