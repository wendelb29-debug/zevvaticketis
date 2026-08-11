-- 1. Create Staff Roles enum
DO $$ BEGIN
    CREATE TYPE public.staff_role AS ENUM ('scanner_only', 'supervisor');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Create event_staff table
CREATE TABLE IF NOT EXISTS public.event_staff (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id uuid REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role public.staff_role DEFAULT 'scanner_only' NOT NULL,
    created_at timestamptz DEFAULT now(),
    UNIQUE (event_id, user_id)
);

-- 3. Grants for event_staff
GRANT SELECT, INSERT, UPDATE, DELETE ON public.event_staff TO authenticated;
GRANT ALL ON public.event_staff TO service_role;

-- 4. Enable RLS for event_staff
ALTER TABLE public.event_staff ENABLE ROW LEVEL SECURITY;

-- 5. Helper function to check if user is staff for a specific event
-- Defined BEFORE policies that use it
CREATE OR REPLACE FUNCTION public.is_event_staff(_user_id uuid, _event_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.event_staff
    WHERE user_id = _user_id
      AND event_id = _event_id
  )
$$;

-- 6. Create checkin_records table
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

-- 7. Create checkin_logs table (dropping to ensure schema)
DROP TABLE IF EXISTS public.checkin_logs CASCADE;
CREATE TABLE public.checkin_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id uuid REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
    operator_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    action text NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz DEFAULT now()
);

-- 8. Grants for checkin tables
GRANT SELECT, INSERT, UPDATE, DELETE ON public.checkin_records TO authenticated;
GRANT ALL ON public.checkin_records TO service_role;
GRANT SELECT, INSERT ON public.checkin_logs TO authenticated;
GRANT ALL ON public.checkin_logs TO service_role;

-- 9. Enable RLS
ALTER TABLE public.checkin_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkin_logs ENABLE ROW LEVEL SECURITY;

-- 10. Policies
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can see their own event staff assignments') THEN
        CREATE POLICY "Users can see their own event staff assignments"
        ON public.event_staff FOR SELECT
        TO authenticated
        USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Staff can view checkin records for their event') THEN
        CREATE POLICY "Staff can view checkin records for their event"
        ON public.checkin_records FOR SELECT
        TO authenticated
        USING (
            public.has_role(auth.uid(), 'admin') OR 
            public.is_event_staff(auth.uid(), event_id)
        );
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Staff can insert checkin records for their event') THEN
        CREATE POLICY "Staff can insert checkin records for their event"
        ON public.checkin_records FOR INSERT
        TO authenticated
        WITH CHECK (
            public.has_role(auth.uid(), 'admin') OR 
            public.is_event_staff(auth.uid(), event_id)
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Staff can view logs for their event') THEN
        CREATE POLICY "Staff can view logs for their event"
        ON public.checkin_logs FOR SELECT
        TO authenticated
        USING (
            public.has_role(auth.uid(), 'admin') OR 
            public.is_event_staff(auth.uid(), event_id)
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Staff can insert logs for their event') THEN
        CREATE POLICY "Staff can insert logs for their event"
        ON public.checkin_logs FOR INSERT
        TO authenticated
        WITH CHECK (
            public.has_role(auth.uid(), 'admin') OR 
            public.is_event_staff(auth.uid(), event_id)
        );
    END IF;
END $$;
