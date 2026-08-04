-- Countries and Currencies: Public
CREATE POLICY "Public can read countries" ON public.countries FOR SELECT USING (true);
CREATE POLICY "Public can read currencies" ON public.currencies FOR SELECT USING (true);

-- Platform Settings: Public
CREATE POLICY "Public can read platform settings" ON public.platform_settings FOR SELECT USING (true);

-- Team Invites
CREATE POLICY "Users can see their own invites" ON public.team_invites FOR SELECT TO authenticated USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));
CREATE POLICY "Members can manage organization invites" ON public.team_invites FOR ALL TO authenticated 
USING (EXISTS (SELECT 1 FROM public.organization_members WHERE organization_id = team_invites.organization_id AND user_id = auth.uid()));

-- Update profiles policy to ensure it exists
DROP POLICY IF EXISTS "Each user only reads/edits own profile" ON public.profiles;
CREATE POLICY "Each user only reads/edits own profile" ON public.profiles FOR ALL TO authenticated USING (id = auth.uid());