// Doc 4.2 §24 — single source of truth for IH upload limits.
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10 MB
export const ALLOWED_UPLOAD_MIME = ['image/png', 'image/jpeg', 'image/webp', 'application/pdf'] as const;
