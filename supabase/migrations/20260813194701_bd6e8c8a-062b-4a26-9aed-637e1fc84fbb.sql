DROP POLICY IF EXISTS "Authenticated can insert access logs" ON public.access_logs;
CREATE POLICY "Platform admins can insert access logs"
ON public.access_logs FOR INSERT TO authenticated
WITH CHECK (auth.uid() = admin_id AND public.check_is_platform_admin(auth.uid()));

DROP POLICY IF EXISTS "Anyone can insert tracking" ON public.tracking;
CREATE POLICY "Anon can insert unattributed tracking"
ON public.tracking FOR INSERT TO anon
WITH CHECK (user_id IS NULL);
CREATE POLICY "Users can insert own tracking"
ON public.tracking FOR INSERT TO authenticated
WITH CHECK (user_id IS NULL OR user_id = auth.uid());