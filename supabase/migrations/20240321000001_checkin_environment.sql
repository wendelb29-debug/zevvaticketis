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

-- 3. Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.event_staff TO authenticated;
GRANT ALL ON public.event_staff TO service_role;

-- 4. Enable RLS
ALTER TABLE public.event_staff ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for event_staff
-- Staff can see their own assignments
CREATE POLICY "Users can see their own event staff assignments"
ON public.event_staff FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Admins and Owners can manage staff
CREATE POLICY "Admins and Owners can manage event staff"
ON public.event_staff FOR ALL
TO authenticated
USING (
    public.has_role(auth.uid(), 'admin') OR 
    EXISTS (
        SELECT 1 FROM public.organization_members om
        JOIN public.events e ON e.organization_id = om.organization_id
        WHERE e.id = event_staff.event_id AND om.user_id = auth.uid() AND om.role IN ('owner', 'admin')
    )
);

-- 6. Helper function to check if user is staff for a specific event
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

-- 7. Update tickets policy to allow staff check-in
-- We already have tickets_checkin_policy_role_scope but let's make it more granular for event_staff
CREATE POLICY "Event staff can view and update tickets for their event"
ON public.tickets FOR ALL
TO authenticated
USING (
    public.is_event_staff(auth.uid(), event_id)
)
WITH CHECK (
    public.is_event_staff(auth.uid(), event_id)
);

