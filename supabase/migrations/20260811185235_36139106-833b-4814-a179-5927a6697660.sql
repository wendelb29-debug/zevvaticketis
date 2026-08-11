-- Revoke public execute on all public SECURITY DEFINER functions to satisfy the linter
REVOKE EXECUTE ON FUNCTION public.promote_to_platform_admin(text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.ensure_producer_organization_admin(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.log_resource_access(text, text, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.check_admin_internal(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_event_staff(uuid, uuid) FROM PUBLIC;

-- Grant execute to specific roles where needed
GRANT EXECUTE ON FUNCTION public.promote_to_platform_admin(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.ensure_producer_organization_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_resource_access(text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_admin_internal(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_event_staff(uuid, uuid) TO authenticated;
-- handle_new_user is for a trigger, usually executed by a superuser/service_role but revoking PUBLIC is standard practice.

-- Ensure RLS policies exist for all check-in tables
-- checkin_records and checkin_logs already have policies from previous turn.
-- Confirming event_staff also has a policy.
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins and Owners can manage event staff') THEN
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
    END IF;
END $$;
