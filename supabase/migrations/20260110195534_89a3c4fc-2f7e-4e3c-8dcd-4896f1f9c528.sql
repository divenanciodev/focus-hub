-- Create storage bucket for contest edital PDFs
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('contest-editals', 'contest-editals', true, 10485760, ARRAY['application/pdf'])
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to read files from the bucket (public)
CREATE POLICY "Anyone can view contest editals"
ON storage.objects FOR SELECT
USING (bucket_id = 'contest-editals');

-- Allow anyone to upload files to the bucket
CREATE POLICY "Anyone can upload contest editals"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'contest-editals');

-- Allow anyone to update their own files
CREATE POLICY "Anyone can update contest editals"
ON storage.objects FOR UPDATE
USING (bucket_id = 'contest-editals');

-- Allow anyone to delete files
CREATE POLICY "Anyone can delete contest editals"
ON storage.objects FOR DELETE
USING (bucket_id = 'contest-editals');