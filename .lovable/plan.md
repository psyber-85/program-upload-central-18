# Patch 1.8 — Editable Program Links & Variable Fields

## Problem

`NotifyHRModal` resolves brochure + signup form URLs from `program_links` by exact `program_title` match. The June–Sept AI training programs have no matching rows, so emails render `[COURSE_BROCHURE_NOT_FOUND]` / `[SIGN_UP_FORM_NOT_FOUND]`. There is no UI to add/edit those links, edit pricing, or override the program name used in the email.

## Scope

Admin editing inside Registration Tracker (`/staff/marketing/register-tracker`) + per-send program-name override in the HR modal. No schema changes — `registration_programs` and `program_links` already exist.

## Changes

### 1. `AddProgramForm.tsx` — expand on create
Add optional fields:
- Pricing (RM)
- Signup form URL
- Brochure URL

On submit: insert `registration_programs`, then upsert `program_links` (key = `program_title`) when either URL is provided.

### 2. New `EditProgramModal.tsx`
Edit existing program. Loads current `registration_programs` row + matching `program_links` row. Fields:
- Title
- Pricing
- Signup form URL
- Brochure URL

Save: update `registration_programs`; upsert `program_links` under new title; if title changed, delete the old `program_links` row to avoid orphans. Single try/catch with toast.

### 3. `ProgramCard.tsx` — edit button + link status chip
- Pencil "Edit" button beside Collapse/Expand → opens `EditProgramModal`.
- Status chip: green "Links: OK" when both URLs present for this title, amber "Links: Missing" otherwise. Makes the June–Sept gap visible at a glance.

### 4. `NotifyHRModal.tsx` — editable program name + hard block on missing links
- Add editable **Program Name** input (defaulted to `prospectData.programTitle`). Used as the lookup key for `program_links` and as the course name in the email body / subject. Re-runs `generateEmailPreview` on change.
- Detect when resolved links contain `[*_NOT_FOUND]` (i.e., no exact or partial match for the typed name). Show a red banner: "Brochure/Sign-up links missing for this program. Add them in Registration Tracker → Edit Program, or adjust the Program Name above to match an existing entry."
- **Disable the Send button** while links are missing. Server-side untouched.

## Files

- edit `src/components/AddProgramForm.tsx`
- create `src/components/registration/EditProgramModal.tsx`
- edit `src/components/registration/ProgramCard.tsx`
- edit `src/components/NotifyHRModal.tsx`

## Out of scope

- Migrating `program_links` to FK on `registration_programs.id` (would need data move).
- Per-program sender overrides, duration, HRDC code, etc. Add later if requested.
- Auto-seeding June–Sept rows — staff fills via the new UI.
