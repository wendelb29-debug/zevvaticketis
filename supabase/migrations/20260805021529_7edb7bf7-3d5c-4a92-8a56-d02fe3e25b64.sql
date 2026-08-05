CREATE OR REPLACE FUNCTION private.is_platform_admin(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.platform_admins WHERE user_id = _user_id) $$;

REVOKE ALL ON FUNCTION private.is_platform_admin(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.is_platform_admin(uuid) TO authenticated, service_role;

DROP POLICY IF EXISTS "Admins can delete webhook errors" ON public.whatsapp_webhook_errors;
CREATE POLICY "Admins can delete webhook errors" ON public.whatsapp_webhook_errors FOR DELETE TO authenticated USING (private.is_platform_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can view webhook errors" ON public.whatsapp_webhook_errors;
CREATE POLICY "Admins can view webhook errors" ON public.whatsapp_webhook_errors FOR SELECT TO authenticated USING (private.is_platform_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can manage email_accounts" ON public.email_accounts;
CREATE POLICY "Admins can manage email_accounts" ON public.email_accounts FOR ALL TO authenticated USING (private.is_platform_admin(auth.uid())) WITH CHECK (private.is_platform_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can manage email_messages" ON public.email_messages;
CREATE POLICY "Admins can manage email_messages" ON public.email_messages FOR ALL TO authenticated USING (private.is_platform_admin(auth.uid())) WITH CHECK (private.is_platform_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can manage whatsapp_instances" ON public.whatsapp_instances;
CREATE POLICY "Admins can manage whatsapp_instances" ON public.whatsapp_instances FOR ALL TO authenticated USING (private.is_platform_admin(auth.uid())) WITH CHECK (private.is_platform_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can manage whatsapp_contacts" ON public.whatsapp_contacts;
CREATE POLICY "Admins can manage whatsapp_contacts" ON public.whatsapp_contacts FOR ALL TO authenticated USING (private.is_platform_admin(auth.uid())) WITH CHECK (private.is_platform_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can manage whatsapp_messages" ON public.whatsapp_messages;
CREATE POLICY "Admins can manage whatsapp_messages" ON public.whatsapp_messages FOR ALL TO authenticated USING (private.is_platform_admin(auth.uid())) WITH CHECK (private.is_platform_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can view email logs" ON public.email_logs;
CREATE POLICY "Admins can view email logs" ON public.email_logs FOR SELECT TO authenticated USING (private.is_platform_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_logs;
CREATE POLICY "Admins can view audit logs" ON public.audit_logs FOR SELECT TO authenticated USING (private.is_platform_admin(auth.uid()));

REVOKE ALL ON FUNCTION public.has_role(uuid, text) FROM authenticated, anon, PUBLIC;