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
GRANT EXECUTE ON FUNCTION public.log_resource_access TO anon;
