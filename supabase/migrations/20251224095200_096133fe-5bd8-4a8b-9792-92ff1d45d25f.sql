-- Create storage bucket for request attachments
insert into storage.buckets (id, name, public)
values ('request-attachments', 'request-attachments', true)
on conflict (id) do nothing;

-- Allow authenticated users to upload files to their own folder
create policy "Users can upload their own attachments"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'request-attachments' 
  and auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow authenticated users to view their own attachments
create policy "Users can view their own attachments"
on storage.objects for select
to authenticated
using (
  bucket_id = 'request-attachments'
  and auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow authenticated users to delete their own attachments
create policy "Users can delete their own attachments"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'request-attachments'
  and auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow public read access for request attachments (since bucket is public)
create policy "Public can view request attachments"
on storage.objects for select
to anon
using (bucket_id = 'request-attachments');