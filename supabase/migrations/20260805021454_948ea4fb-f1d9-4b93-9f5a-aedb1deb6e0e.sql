-- 1. Privilege escalation: remove client-side ownership claim
DROP POLICY IF EXISTS "Users can claim ownership of an empty organization" ON public.organization_members;
DROP FUNCTION IF EXISTS private.org_has_members(uuid);

-- 2. Avatars: restrict public read
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Authenticated users can view avatars"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'avatars');

-- 3. Revoke execute on unused SECURITY DEFINER function
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM authenticated, anon, PUBLIC;