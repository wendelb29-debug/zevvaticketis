-- Add avatar and notification preferences to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS avatar_url text,
ADD COLUMN IF NOT EXISTS notif_lembrete_evento boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS notif_mudancas_evento boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS notif_novidades boolean DEFAULT false;

-- Storage policies for avatars
-- 1. Public Read
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Access' AND tablename = 'objects' AND schemaname = 'storage') THEN
        CREATE POLICY "Public Access" 
        ON storage.objects FOR SELECT 
        USING (bucket_id = 'avatars');
    END IF;
END $$;

-- 2. Authenticated Upload (Own folder)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can upload an avatar' AND tablename = 'objects' AND schemaname = 'storage') THEN
        CREATE POLICY "Authenticated users can upload an avatar" 
        ON storage.objects FOR INSERT 
        TO authenticated 
        WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
    END IF;
END $$;

-- 3. Authenticated Update/Delete (Own folder)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update their own avatar' AND tablename = 'objects' AND schemaname = 'storage') THEN
        CREATE POLICY "Users can update their own avatar" 
        ON storage.objects FOR UPDATE 
        TO authenticated 
        USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete their own avatar' AND tablename = 'objects' AND schemaname = 'storage') THEN
        CREATE POLICY "Users can delete their own avatar" 
        ON storage.objects FOR DELETE 
        TO authenticated 
        USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
    END IF;
END $$;
