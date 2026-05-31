
UPDATE storage.buckets
SET file_size_limit = 10485760,
    allowed_mime_types = ARRAY['application/pdf']
WHERE id = 'payslips';

UPDATE storage.buckets
SET file_size_limit = 10485760,
    allowed_mime_types = ARRAY['image/png','image/jpeg','image/webp','application/pdf']
WHERE id = 'request-attachments';
