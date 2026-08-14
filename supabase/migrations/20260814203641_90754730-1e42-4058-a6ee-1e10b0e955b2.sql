CREATE OR REPLACE FUNCTION public.check_user_is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    WHEN _user_id IS NULL OR auth.uid() IS NULL OR _user_id <> auth.uid() THEN false
    ELSE EXISTS (SELECT 1 FROM public.platform_admins pa WHERE pa.user_id = _user_id)
  END
$$;