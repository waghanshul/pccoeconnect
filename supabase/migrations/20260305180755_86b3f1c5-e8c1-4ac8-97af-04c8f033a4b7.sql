-- Drop existing permissive INSERT policy on post_media bucket
DROP POLICY IF EXISTS "Authenticated users can upload post media" ON storage.objects;

-- Create a more restrictive INSERT policy that scopes to user folder and validates file type
CREATE POLICY "Authenticated users can upload post media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'post_media' AND
  (storage.foldername(name))[1] = auth.uid()::text AND
  (
    LOWER(storage.extension(name)) IN ('jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf', 'mp4', 'mov', 'webm')
  )
);