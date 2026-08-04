
-- 1. Checkin Logs Table
CREATE TABLE public.checkin_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id uuid NOT NULL, -- Will add FK after creating tickets table
    operator_id uuid REFERENCES auth.users(id) NOT NULL,
    resultado text NOT NULL CHECK (resultado IN ('sucesso', 'duplicado', 'invalido')),
    scanned_at timestamptz DEFAULT now()
);

GRANT SELECT, INSERT ON public.checkin_logs TO authenticated;
GRANT ALL ON public.checkin_logs TO service_role;
ALTER TABLE public.checkin_logs ENABLE ROW LEVEL SECURITY;

-- 2. Update tickets table to include QR and status
ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS order_id uuid;
ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS ticket_type_id uuid;
ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS owner_id uuid REFERENCES auth.users(id);
ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS qr_code text UNIQUE;
ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS status text DEFAULT 'valido' CHECK (status IN ('valido', 'presente', 'falta', 'cancelado', 'transferido'));
ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS checked_in_at timestamptz;
ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS attendance_source text CHECK (attendance_source IN ('qrcode', 'manual', 'auto_falta'));

-- Add FK for checkin_logs
ALTER TABLE public.checkin_logs ADD CONSTRAINT checkin_logs_ticket_id_fkey FOREIGN KEY (ticket_id) REFERENCES public.tickets(id) ON DELETE CASCADE;

-- Update events table for auto-no-show
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS falta_automatica_minutos integer DEFAULT 60;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS falta_automatica_ativa boolean DEFAULT false;

-- 3. RLS for tickets
CREATE POLICY "Users can view their own tickets"
ON public.tickets
FOR SELECT
TO authenticated
USING (auth.uid() = owner_id);

CREATE POLICY "Checkin operators can view and update tickets"
ON public.tickets
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.organization_members om
        JOIN public.events e ON e.id = tickets.event_id
        WHERE om.organization_id = (
            SELECT organization_id FROM public.organization_members 
            WHERE user_id = auth.uid() 
            LIMIT 1
        )
        AND om.user_id = auth.uid()
    )
);

-- RLS for checkin_logs
CREATE POLICY "Members can view logs of their events"
ON public.checkin_logs
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.tickets t
        JOIN public.events e ON e.id = t.event_id
        JOIN public.organization_members om ON om.organization_id = (
            SELECT organization_id FROM public.organization_members 
            WHERE user_id = auth.uid() 
            LIMIT 1
        )
        WHERE t.id = checkin_logs.ticket_id
        AND om.user_id = auth.uid()
    )
);
