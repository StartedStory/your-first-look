
-- Lock down SECURITY DEFINER helpers — they should only be called from RLS / triggers, not by API clients
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- Replace broad public SELECT on storage with narrower policies
DROP POLICY IF EXISTS "Public read videos" ON storage.objects;
DROP POLICY IF EXISTS "Public read thumbnails" ON storage.objects;

-- Owners can list/select their own files
CREATE POLICY "Owners read own video files" ON storage.objects FOR SELECT
  USING (bucket_id = 'videos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Owners read own thumbnail files" ON storage.objects FOR SELECT
  USING (bucket_id = 'thumbnails' AND auth.uid()::text = (storage.foldername(name))[1]);
-- (Public URLs still work because the bucket is public; this only restricts the LIST/metadata API)
