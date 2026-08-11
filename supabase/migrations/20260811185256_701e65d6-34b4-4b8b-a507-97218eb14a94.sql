-- 1. Add missing RLS policies for tables reported by linter
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'app_user_connections') THEN
        CREATE POLICY "Users can manage their own app connections"
        ON public.app_user_connections FOR ALL
        TO authenticated
        USING (user_id = auth.uid());
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'plans') THEN
        CREATE POLICY "Plans are viewable by everyone"
        ON public.plans FOR SELECT
        TO PUBLIC
        USING (true);
    END IF;
END $$;

-- 2. Convert internal SECURITY DEFINER functions to SECURITY INVOKER where possible
-- These don't need to bypass RLS as they already use RLS-restricted tables
ALTER FUNCTION public.is_event_staff(uuid, uuid) SECURITY INVOKER;
ALTER FUNCTION public.check_admin_internal(uuid) SECURITY INVOKER;
ALTER FUNCTION public.ensure_producer_organization_admin(uuid) SECURITY INVOKER;
ALTER FUNCTION public.log_resource_access(text, text, text) SECURITY INVOKER;

-- handle_new_user and promote_to_platform_admin still need SECURITY DEFINER 
-- to write to auth/admin tables, but execute rights were already restricted to authenticated.
