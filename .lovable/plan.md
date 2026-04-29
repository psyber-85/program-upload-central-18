## Goal

Add a bulk-upload tool to the Birthday Dashboard (`/staff/marketing/birthdays`) so users can upload a CSV/XLSX file of personnel with their birthdays. Records will be inserted into the same table the birthday system already reads from (`participants_bday_duplicate`), guaranteeing they show up in stats, today's list, and "Send Remaining".

## Backend Alignment (no schema changes)

The existing birthday edge functions (`birthday`, `birthday-log`, `send-remaining`) all read/write `participants_bday_duplicate`. We will write to the same table to stay 100% consistent.

Columns used by the system:
- `name` (text, required)
- `email` (text, required)
- `nric_number` (text, required by schema)
- `phone` (text, optional)
- `birth_date` (date, e.g. 1991-09-23) — used to compute `birth_mmdd`
- `birth_mmdd` (text MM-DD) — what `birthday` function matches against today
- `program_name` (text, required)
- `program_id` (uuid, required) — defaulted to a fixed "Bulk Upload" program if not resolvable
- `key_skills` (text, optional)
- `email_sent` (bool, default false)
- `last_birthday_sent_year` (text, leave null)
- `registered_at` (timestamptz, default now())

No DB migration needed. RLS already permits inserts in this project context (used by edge functions and admin UI). If insert is blocked from the client, we'll route through a tiny edge function (`bulk-upload-birthdays`) using the service-role key.

## Upload File Format

Accept `.csv`, `.xlsx`, `.xls`. Required headers (first row):

```text
name, email, nric_number, phone, birth_date, program_name, key_skills
```

Rules:
- `birth_date` accepts `YYYY-MM-DD`, `DD/MM/YYYY`, or Excel date serials. We compute `birth_mmdd` automatically as `MM-DD`.
- `phone` and `key_skills` are optional.
- `program_name` required (free text — e.g. "6021 NTW List"). We try to resolve `program_id` from the existing `programs` table by matching `title`; if not found, we fall back to a generated UUID stored in a single "Bulk Upload" program row (created on first use) so the NOT NULL `program_id` constraint is satisfied.
- Duplicate guard: skip rows where `(email, birth_mmdd)` already exists in the table.

## UI Changes

File: `src/pages/BirthdayDashboard.tsx`

Add a new card "Upload Birthday List" alongside the existing cards with:
- File input (`.csv,.xlsx,.xls`)
- "Download template" button (generates a sample CSV client-side)
- Preview: shows row count + first 3 rows after parsing
- "Upload" button → parses with `xlsx` (already used in `BulkUploadForm.tsx`), validates, inserts in batches of 200
- Result toast: `Inserted X, Skipped Y duplicates, Z errors`
- After success, calls `fetchStats()` to refresh dashboard

New helper file: `src/components/marketing/BirthdayBulkUploadCard.tsx` (keeps `BirthdayDashboard.tsx` clean).

## Validation & Errors

Per-row validation surfaces a downloadable error report (CSV) listing row number + reason for any rejected rows (missing email, bad date, missing program_name, etc.). Valid rows still get inserted.

## Out of Scope

- No edits to existing edge functions.
- No changes to `participants_bday` (legacy table) — only `participants_bday_duplicate`.
- No new auth/role rules.

## Files to Add / Edit

- Add: `src/components/marketing/BirthdayBulkUploadCard.tsx`
- Edit: `src/pages/BirthdayDashboard.tsx` (mount the new card)
- Optional (only if client insert is RLS-blocked at runtime): add `supabase/functions/bulk-upload-birthdays/index.ts` and register it in `supabase/config.toml`.
