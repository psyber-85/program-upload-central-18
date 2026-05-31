## Patch 1.4 — Request Flow Completion (Plan)

Surgical completion of the request layer. No DB policy changes (entitlements, thresholds, payroll formula, payslip layout, storage strategy, RLS all untouched per §3 and §31). DB schema already supports `Training`, `Benefit`, `NeedsCorrection`, and `archived_at`, so the bulk of work is frontend + a small repo expansion + one additive migration for activity events.

### Current vs target (gap summary)

| Area | Current | Patch 1.4 target |
|---|---|---|
| Request types in UI | Leave / MC / Claim only (one shared modal) | Leave / MC / Claim / Training / Benefit / Other, each with its own form |
| New Request entry | Single dialog inside `RequestsIndex` | Type selector → per-type form; Quick Actions deep-link |
| Detail page | None | `/staff/requests/:id` with all §6 fields + timeline + next action |
| Activity timeline | Not implemented | New `ih_request_events` table + timeline UI (§7 event labels) |
| Needs Correction loop | Status exists, no UI flow | Admin marks w/ required comment, staff edits same record, resubmits |
| Admin queue | One flat "pending" tab | Grouped tabs: Leave/MC, Claims, Training, Benefits/Other + filters (status, staff, type, date) |
| Staff list next action | Single "View" implicit | Status badge + per-row next action (Fix / View Outcome / Upload Proof / Mark Completed / Submit Training Claim / View Payroll Inclusion) |
| MC labelling | "Approved/Rejected" | "Accepted / Recorded" UI label, internally still Completed/Approved |
| Training Fund | Single generic flow | Application → Completion → Claim (linked records) |
| Benefit | Not in UI selector | Suggested-topics form |
| Other Request | Missing | Guardrail form (categories, no IT/PM dumping ground) |
| Attachment honesty | Real upload to bucket (good) | Keep production storage. Where used as placeholder metadata, show clear "metadata only" badge — but since storage is already live we keep real upload as primary |
| Home/Pending integration | NeedsCorrection wired (Patch 1.3) | Add: training proof pending, payroll-inclusion outcomes; admin workbench gets grouped pending |

### Files to create

**Pages / routes**
- `src/pages/staff/hub/requests/RequestDetail.tsx` — §6 detail layout, timeline, next action
- `src/pages/staff/hub/requests/NewRequest.tsx` — type-selector landing + supports `?type=Leave|MC|Claim|Training|Benefit|Other` deep link from Quick Actions
- `src/pages/staff/hub/requests/forms/LeaveForm.tsx`
- `src/pages/staff/hub/requests/forms/McForm.tsx`
- `src/pages/staff/hub/requests/forms/ClaimForm.tsx`
- `src/pages/staff/hub/requests/forms/TrainingApplicationForm.tsx`
- `src/pages/staff/hub/requests/forms/TrainingCompletionForm.tsx` (mounted from detail page)
- `src/pages/staff/hub/requests/forms/TrainingClaimForm.tsx` (mounted from detail page)
- `src/pages/staff/hub/requests/forms/BenefitForm.tsx`
- `src/pages/staff/hub/requests/forms/OtherRequestForm.tsx`
- `src/pages/staff/hub/admin/requests/AdminRequestsQueue.tsx` — grouped tabs + filters (replaces admin tab inside RequestsIndex)

**Components**
- `src/components/internal-hub/requests/RequestStatusBadge.tsx` — MC label override
- `src/components/internal-hub/requests/RequestTimeline.tsx`
- `src/components/internal-hub/requests/NextActionButton.tsx` — derives action from `(kind, status, subState)`
- `src/components/internal-hub/requests/CorrectionPanel.tsx` — appears when status=NeedsCorrection
- `src/components/internal-hub/requests/AttachmentList.tsx` (extract from current RequestsIndex)
- `src/components/internal-hub/requests/ProofWaiverDialog.tsx` (admin)

**Repos / logic**
- `src/lib/internal-hub/repos/requestEventsRepo.ts` — list/insert events
- Extend `requestRepo.ts`: `get(id)`, `update(id, payload)`, `markNeedsCorrection({id,note,adminId})`, `resubmit(id)`, `waiveProof({id,reason,adminId})`, `markCompleted({id, kind})`, `linkTrainingClaim({applicationId, claimId})`. Each writes a row to `ih_request_events`.

### Files to edit

- `src/App.tsx` — add `/staff/requests/new`, `/staff/requests/:id` routes; route `/staff/admin/requests` to `AdminRequestsQueue`.
- `src/pages/staff/hub/requests/RequestsIndex.tsx` — replace embedded modal with link to `/staff/requests/new`; rebuild list rows to show status badge + NextAction; keep staff-only view (admin moves to AdminRequestsQueue).
- `src/components/internal-hub/home/QuickActionsCard.tsx` (or wherever Quick Actions live) — deep-link to `/staff/requests/new?type=…`.
- `src/lib/internal-hub/workbench/pendingItems.ts` — add: Training-completion-pending, payroll-inclusion outcomes (best-effort, only when useful per §28).
- `src/lib/internal-hub/workbench/adminWorkbench.ts` — already pulls pending approvals; add training-application vs training-claim distinction.

### Files explicitly NOT touched

- All payroll, payslip, finance-snapshot code (Patches 1.5/1.6 territory).
- Marketing surfaces (`/staff/marketing`).
- RLS / storage policies / GRANTs (no schema-change on existing tables).
- Entitlement/threshold logic in `claimRepo`, `payrollRepo`, leave balance calc.
- `requestSummaryRepo` (already Patch 1.3-correct).

### Migration (additive only)

```sql
-- ih_request_events: append-only activity timeline.
CREATE TABLE public.ih_request_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES public.ih_requests(id) ON DELETE CASCADE,
  event_type text NOT NULL,        -- 'Submitted'|'AdminReviewed'|'NeedsCorrection'|'Resubmitted'|'Approved'|'Rejected'|'Completed'|'IncludedInPayroll'|'AttachmentAdded'|'ProofWaived'|'TrainingCompleted'|'AutoApproved'
  actor_id uuid,                   -- nullable for system events
  note text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.ih_request_events TO authenticated;
GRANT ALL ON public.ih_request_events TO service_role;
ALTER TABLE public.ih_request_events ENABLE ROW LEVEL SECURITY;

-- Read: requester or admin can read events for their request.
CREATE POLICY "ih_request_events_read"
ON public.ih_request_events FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.ih_requests r
    WHERE r.id = request_id
      AND (r.staff_id = auth.uid() OR public.has_ih_role(auth.uid(), 'admin'::ih_app_role))
  )
);

-- Insert: requester (for their request) or admin.
CREATE POLICY "ih_request_events_insert"
ON public.ih_request_events FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.ih_requests r
    WHERE r.id = request_id
      AND (r.staff_id = auth.uid() OR public.has_ih_role(auth.uid(), 'admin'::ih_app_role))
  )
);

-- Immutable: no UPDATE/DELETE policies. Hard-delete blocked via trigger reuse:
CREATE TRIGGER ih_request_events_no_delete
BEFORE DELETE ON public.ih_request_events
FOR EACH ROW EXECUTE FUNCTION public.ih_block_hard_delete();
```

Also adds two nullable cols to `ih_requests` for Training linkage and sub-state (no defaults that change existing rows):

```sql
ALTER TABLE public.ih_requests
  ADD COLUMN IF NOT EXISTS training_application_id uuid REFERENCES public.ih_requests(id),
  ADD COLUMN IF NOT EXISTS sub_state text;   -- e.g. 'ApplicationApproved','TrainingCompleted','ClaimSubmitted'
```

### Acceptance mapping (§32)

- Request forms ✅ per-type files + selector + Quick Action deep-link + Other-as-fallback + Benefit topics.
- Request detail ✅ `RequestDetail.tsx` renders all §6 fields + timeline + next action.
- Correction loop ✅ admin comment required (form validation), same record edited via `update`+`resubmit`, events logged.
- Admin queue ✅ grouped tabs + filters (status / staff / type / date).
- Staff list ✅ badges + NextActionButton per row.
- Attachment ✅ keep existing real upload, no fake placeholders.
- Scope control ✅ no edits to entitlement / formula / payslip / RLS-on-existing-tables.

### Order of execution after approval

1. Migration (additive only) — wait for approval.
2. Repo extensions (`requestRepo`, new `requestEventsRepo`).
3. New Request page + per-type form components.
4. Request Detail page + Timeline + CorrectionPanel + NextActionButton.
5. Admin grouped queue.
6. Wire Quick Action deep-links.
7. Extend workbench aggregators.
8. Update `RequestsIndex` to use new list rows and remove embedded modal.
9. Verify build, smoke-test routes.

No memory updates required (Patch 1.4 is workflow completion, not new doctrine). Memory note added after implementation listing the request-flow patch as authority.
