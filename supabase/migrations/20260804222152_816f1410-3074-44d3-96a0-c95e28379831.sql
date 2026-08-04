-- Ensure RLS is active
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;

-- Explicitly allow authenticated users to see their own organization memberships
DROP POLICY IF EXISTS "Users can view their own organization members" ON public.organization_members;
CREATE POLICY "Users can view their own organization members" ON public.organization_members
FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Explicitly allow members to view their organization details
DROP POLICY IF EXISTS "Members can view their organization" ON public.organizations;
CREATE POLICY "Members can view their organization" ON public.organizations
FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.organization_members 
    WHERE organization_id = public.organizations.id 
    AND user_id = auth.uid()
  )
);
