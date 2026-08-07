-- Create access_logs table for auditing sensitive data views
CREATE TABLE public.access_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    resource_type text NOT NULL, -- 'whatsapp_credentials', 'whatsapp_logs', 'webhook_events'
    resource_id text, -- ID of the specific record if applicable
    action text NOT NULL DEFAULT 'view',
    ip_address text,
    user_agent text,
    created_at timestamptz DEFAULT now()
);

-- RLS and Grants
ALTER TABLE public.access_logs ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT ON public.access_logs TO authenticated;
GRANT ALL ON public.access_logs TO service_role;

-- Only platform admins can see all logs
CREATE POLICY "Admins can view all access logs"
ON public.access_logs
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Anyone authenticated can insert (to log their own access)
CREATE POLICY "Authenticated can insert access logs"
ON public.access_logs
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = admin_id);

-- Helper function to log access from frontend
CREATE OR REPLACE FUNCTION public.log_resource_access(
    _resource_type text,
    _resource_id text DEFAULT NULL,
    _action text DEFAULT 'view'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.access_logs (admin_id, resource_type, resource_id, action)
    VALUES (auth.uid(), _resource_type, _resource_id, _action);
END;
$$;

GRANT EXECUTE ON FUNCTION public.log_resource_access TO authenticated;
