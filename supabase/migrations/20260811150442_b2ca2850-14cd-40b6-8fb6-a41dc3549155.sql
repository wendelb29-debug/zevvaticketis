GRANT SELECT ON public.platform_admins TO authenticated;
GRANT SELECT ON public.platform_admins TO anon;
GRANT ALL ON public.platform_admins TO service_role;

ALTER TABLE public.platform_admins ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'platform_admins' AND policyname = 'Public select own admin') THEN 
    CREATE POLICY "Public select own admin" ON public.platform_admins FOR SELECT TO authenticated USING (user_id = auth.uid()); 
  END IF; 
END $$;