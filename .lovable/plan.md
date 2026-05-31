# Sub-batch 2C — Requests, Claims & Attachments → Supabase

Convert the remaining request/claim repos from `localStorage` to `ih_requests` + `ih_request_attachments` (Phase 1 tables already exist with RLS).

## Scope

Two repos + their callsites. RequestsIndex itself is still a Card 2 stub, so the actual leave/claim creation UI is **out of scope** — we only wire the data layer + the previews that already consume it.

### 1. `requestSummaryRepo.ts` → Supabase
Back with `ih_requests` table.
- `listForStaff(staffId, limit?)` → `select id, staff_id, kind, status, created_at` where `staff_id=staffId`, order desc.
- `pendingCountForStaff(staffId)` → count where `staff_id=staffId AND status='Submitted'`.
- `pendingApprovalCount()` → count where `status='Submitted'` (admin only; RLS returns 0 for non-admins, which is fine).
- Map DB `kind` (`Leave|MC|Claim|Training|Benefit`) ↔ app `type` (`Leave|MC|Claim|TrainingFund|Insurance|Other`): `Training→TrainingFund`, `Benefit→Insurance`.
- Map DB `status` (`Submitted|Approved|Rejected|NeedsCorrection|Cancelled`) ↔ app `RequestStatus` (`Pending|Approved|Rejected|Submitted`): treat `Submitted`/`NeedsCorrection` as `Pending` for display; keep `Submitted` as the canonical pending state for counts.
- Drop `_seed`.

### 2. `claimRepo.ts` → Supabase
Claims live in `ih_requests` with `kind='Claim'` and a `payload` jsonb carrying `{ amount, description, type: 'Claim'|'TrainingClaim', inclusionState, includedInPayrollRunId, includedInMonth }`. (No separate `ih_claims` table exists — the spec folds them in.)
- `list()` → all `kind='Claim'` rows, decoded.
- `queueableForMonth(month)` → approved claims (`status='Approved'`) with `payload->>'inclusionState' != 'IncludedInPayroll'` and `decided_at < first-of-month`.
- `markIncluded(ids, runId, month)` → update payload jsonb for those rows.
- `setStateForRun(runId, state)` → same, filtered by `payload->>'includedInPayrollRunId'`.
- `addManual(input)` → insert row with `kind='Claim'`, `status='Approved'`, `decided_at=now`.
- All methods become **async**.

### 3. Callsite updates
- `src/pages/staff/hub/StaffHome.tsx` — wrap `requestSummaryRepo` calls (recent list, `myPendingRequests`, `pendingApprovals`) in `useQuery`. Mirror the pattern already used for notices.
- `src/lib/internal-hub/repos/payrollRepo.ts` — `claimRepo.queueableForMonth` (line 55) and `claimRepo.markIncluded` (line 221) become awaited calls. The functions that contain them (`previewForMonth`, `finalize`) likely already return promises; if not, promote them. Re-read first and adapt minimally.
- `MyRecentRequestsPreview.tsx` — check whether it reads directly or via StaffHome; convert to `useQuery` if needed.

### 4. Attachments
`ih_request_attachments` table + `request-attachments` storage bucket are already provisioned with RLS. **No repo wrapper needed yet** — no UI in Sub-batch 2C creates requests with attachments (that's Card 2). Defer to when the request-creation UI lands.

## Out of scope
- Building the actual request submission/approval UI (Card 2).
- Audit logging on status changes (Doc 4.3 — separate sub-batch).
- Realtime subscriptions.

## Verification
- `npm run build` clean.
- StaffHome renders without runtime errors; recent-requests preview shows empty state (DB is empty, expected).
- Payroll preview page still loads (claims are async now).
