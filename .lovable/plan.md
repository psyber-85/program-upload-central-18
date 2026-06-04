## Patch 1.6 — Full spec alignment (Groups A + B)

Ships all 10 drift findings in one loop. Grouped by file/area for review.

---

### 1. Staff lifecycle: kill the Pending dead-end (F-01, F-02, A6, A7)

- `supabase/functions/ih-create-staff/index.ts:87` — `status: "Pending"` → `status: "Active"`.
- `src/lib/internal-hub/repos/staffRepo.ts:48` — fix mapRow to preserve `Pending` (defense-in-depth):
  `status: r.status === 'Active' ? 'Active' : r.status === 'Pending' ? 'Pending' : 'Inactive'`
- Migration: backfill any existing `Pending` rows to `Active` (covers `idzham@theaihq.net`). Wrap in `ALTER TABLE ... DISABLE TRIGGER USER` / re-enable to bypass the sensitive-field guard.
- Revert my earlier Pending-rejection patches:
  - `src/contexts/AuthContext.tsx` — remove the "pending activation" branch in `login()`.
  - `src/components/internal-hub/InternalHubLayout.tsx` — remove `?reason=pending` redirect.
  - `src/pages/Login.tsx` — remove `?reason=pending` message branch.
- Keep `StaffStatus` type 3-valued; DB enum unchanged.

### 2. Required businessArm (F-06)

- `supabase/functions/ih-create-staff/index.ts:89` — remove `?? "Training"`. Validate `businessArm ∈ {Training, Solutions, Both}` server-side; return 400 if missing/invalid. Form already requires it.

### 3. Payslip PDF footer email (F-07)

- `supabase/functions/ih-generate-payslip-pdf/index.ts:143` — `system@theaihq.net` → `wani@theaihq.net`.

### 4. Block hard-delete server-side (F-04)

- Migration: add `BEFORE DELETE` trigger on `ih_staff_profiles` using existing `ih_block_hard_delete()` (allows `service_role`, blocks everything else). Keeps `AdminStaffDetail.tsx:123` client-side guard as UX.

### 5. Insurance coverage wired up (F-03)

- Migration: add `insurance_covered boolean not null default false` to `ih_staff_profiles`.
- `staffRepo.ts:56` — map `insuranceCovered: !!r.insurance_covered`.
- `staffRepo.update()` — accept `insuranceCovered` patches.
- `HubContext.tsx` — same mapping fix (currently also hardcoded false).
- `AdminStaffDetail.tsx` — add a simple toggle in the Compensation/HR section (admin-only). No new page, no new component file.

### 6. Notice types (F-09)

- Migration: add `type ih_notice_type` column to `ih_notices` (new enum with the 7 values from `NoticeType`); default `'AdminBroadcast'`; backfill existing rows to `'AdminBroadcast'`.
- `noticeRepo.ts:41-42, 68-69` — write/read `type` instead of hardcoding.
- `BroadcastForm.tsx` — add type selector (Select). Default `AdminBroadcast`.
- `NoticeBadges.tsx` already uses `NOTICE_TYPE_LABELS` — will start working.

### 7. Admin audience preserved (F-10)

- Migration: extend `ih_notices.audience` text values to include `'Admin'`. Update the `ih_notice targeted read` RLS policy to gate `audience = 'Admin'` to `has_ih_role(auth.uid(), 'admin')`.
- `noticeRepo.ts:41-42` — stop downgrading `'Admin'` to `'Everyone'`. Read back as `{ kind: 'Admin' }`.
- `BroadcastForm.tsx` audience picker already exposes Admin — will start working end-to-end.

### 8. Broadcast log surface (F-05)

- Migration: add `ih_broadcast_log` table:
  - cols: `id uuid pk`, `notice_id uuid`, `broadcast_at timestamptz default now()`, `recipient_count int`, `audience text`, `email_required bool`, `created_by uuid`
  - GRANTs: SELECT/INSERT to `authenticated`, ALL to `service_role`
  - RLS: admin-only read+insert
- `noticeRepo.broadcast()` — on create, insert log row with computed `recipientCount` (count of active staff matching audience).
- `noticeRepo.listBroadcastLog()` / `broadcastLogFor()` — return real rows.

### 9. Tool access in Supabase (F-08)

- `ih_tool_access` table already exists (good). Rewrite `toolAccessRepo.ts` to read/write Supabase instead of `localStorage`:
  - `list(staffId)`, `setStatus(staffId, tool, status)`, `markGranted(staffId, tool)`.
  - RLS already correct (admin manage; staff self-read).
- Keep API shape stable so call sites don't change. Audit on status change via `logAudit`.
- One-time migration to copy any cached localStorage entries → DB is **not** included (low value; users re-tick).

### 10. Memory updates

- Update `mem://internal-hub/lifecycle-doc-0.2`: staff are created Active; no Pending in practice.
- Update `mem://internal-hub/notices-resources-doc-1.2`: notice `type` and `Admin` audience are now real.
- Update `mem://index.md` Core: "Internal Hub staff lifecycle is Active ↔ Inactive only."

---

### Migrations (combined into one or two)

1. Backfill Pending→Active on `ih_staff_profiles`.
2. Add `BEFORE DELETE` trigger on `ih_staff_profiles` → `ih_block_hard_delete()`.
3. `ALTER TABLE ih_staff_profiles ADD COLUMN insurance_covered boolean not null default false`.
4. `CREATE TYPE ih_notice_type AS ENUM (...)`, `ALTER TABLE ih_notices ADD COLUMN type ih_notice_type not null default 'AdminBroadcast'`.
5. Update `ih_notice targeted read` policy to allow `audience = 'Admin'` for admins only.
6. `CREATE TABLE ih_broadcast_log (...)` + GRANTs + RLS + admin policies.

### Files touched (code)

- `supabase/functions/ih-create-staff/index.ts`
- `supabase/functions/ih-generate-payslip-pdf/index.ts`
- `src/contexts/AuthContext.tsx`
- `src/components/internal-hub/InternalHubLayout.tsx`
- `src/pages/Login.tsx`
- `src/lib/internal-hub/HubContext.tsx`
- `src/lib/internal-hub/repos/staffRepo.ts`
- `src/lib/internal-hub/repos/noticeRepo.ts`
- `src/lib/internal-hub/repos/toolAccessRepo.ts`
- `src/pages/staff/hub/admin/AdminStaffDetail.tsx` (insurance toggle)
- `src/pages/staff/hub/notices/admin/BroadcastForm.tsx` (type selector)
- Memory files (3)

### Out of scope

- Marketing portal — untouched.
- Onboarding/welcome-email flow — untouched.
- No new pages or routes.
- localStorage→DB migration for tool access (drop cache, fresh start).

### Verification

- `Pending` count in `ih_staff_profiles` = 0 after migration.
- Idzham + Zarnaaz can log in and land on `/staff`.
- Fresh invite via `ih-create-staff` lands user on `/staff` immediately.
- Manual DELETE attempt against `ih_staff_profiles` from SQL editor raises the trigger error.
- Insurance toggle on admin detail page persists.
- Broadcast with type=PayrollNotice and audience=Admin → only admins see it; badge shows "Payroll".
- `ih_broadcast_log` row appears after broadcast with correct `recipient_count`.
- Tool access checkboxes survive page reload and are visible to admin on another machine.

**Approve to proceed.**
