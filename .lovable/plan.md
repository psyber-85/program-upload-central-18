# Plan — Phase 2: Repo → Supabase swap (sub-batched)

## The core challenge

Today's repos return data **synchronously** (`staffRepo.list()` → `StaffProfile[]`). Supabase calls are **async**. So every callsite — ~35 components — must change from direct sync calls to either `useEffect`+state or TanStack Query hooks.

To control blast radius, I'll ship in **4 sub-batches**, each touching one functional domain. After each, you test and approve.

---

## Strategy (applies to every sub-batch)

1. Rewrite the repo file: same exported method names, but each returns `Promise<T>`.
2. Wrap callsites in TanStack Query (`useQuery`/`useMutation`) — `@tanstack/react-query` is already in the project.
3. Drop seed/`ensureSeed()` logic — data lives in Supabase. (`seed.ts` and `seedNotices.ts` become unused; deleted in Sub-batch 2D cleanup.)
4. Keep type mapping (DB snake_case → app camelCase) inside each repo so component code is unchanged in shape.
5. Lazy `require()` calls (e.g. noticeRepo→staffRepo) replaced with awaited Supabase queries — fixes the residual circular-dep issue too.

---

## Sub-batch 2A — Staff + Profiles (foundation)

**Repo:** `staffRepo`
**DB:** `ih_staff_profiles` (already used by `HubContext`)
**Callsites (~7):** `AdminStaffList`, `AdminStaffDetail`, `AdminAddStaff`, `MyProfile`, `StaffFormFields`, `StaffStatusBadge`, `home/MyRecentRequestsPreview`.
**Notes:**
- `staffRepo.list()` admin-only (RLS already enforces).
- `create()` becomes: invite via auth admin (already done by `AdminAddStaff` edge function) + insert profile row.
- `deactivate()`/`reactivate()` → `update({status})`; sensitive-field trigger from earlier migration enforces admin-only.

---

## Sub-batch 2B — Notices + Resources

**Repos:** `noticeRepo`, `resourceRepo`
**DB:** `ih_notices`, `ih_notice_reads`, `ih_notice_acks`, `ih_resources`
**Callsites (~10):** `NoticesList`, `NoticeDetail`, `BroadcastForm`, `AckReport`, `ResourcesIndex`, `ManageResources`, `home/LatestNoticesPreview`, plus the unread-count badge in `HubSidebar`/`HubMobileNav`.
**Notes:**
- `broadcast()` writes Notice + audience-resolution lives client-side (we already gate on RLS); SendGrid fanout deferred to Phase 3.
- `archive()` sets `archived_at = now()` (NOT delete — trigger from Phase 1 blocks hard-delete).
- `ackReport()` becomes admin-only Supabase query joining `ih_staff_profiles` + `ih_notice_acks`.

---

## Sub-batch 2C — Requests, Claims, Attachments

**Repos:** `claimRepo`, `requestSummaryRepo`
**DB:** `ih_requests`, `ih_request_attachments` + `request-attachments` storage bucket (already exists)
**Callsites (~5):** existing request/claim pages + `home/MyRecentRequestsPreview`.
**Notes:**
- File uploads switch from base64-in-localStorage to Supabase Storage (signed URL on download).
- Sensitive WITH CHECK from Phase 1 enforces no self-approval.

---

## Sub-batch 2D — Payroll, Payslips, Finance, Lifecycle (admin-heavy)

**Repos:** `payrollRepo`, `payslipRepo`, `payslipSummaryRepo`, `financeSnapshotRepo`, `toolAccessRepo`, `onboardingRepo`, `offboardingRepo`, `welcomeEmailRepo`
**DB:** `ih_payroll_runs`, `ih_payroll_items`, `ih_payslips`, `ih_payslip_downloads`, `ih_finance_snapshots`, `ih_tool_access`, `ih_access_checklist`, `ih_welcome_emails`
**Callsites (~13):** all admin payroll/finance pages + `MyPayslipsPreview`, `PayslipsIndex`, `PayslipDetail`, `ChecklistItemRow`, `NotionUnlockBanner`, `ToolAccessRow`, `OnboardingStateBadge`, `WelcomeEmailStatus`.
**Cleanup at the end:** delete `storage.ts`, `seed.ts`, `seedNotices.ts`.

---

## Risk mitigation

- **Loading states**: every converted component will show a skeleton/spinner instead of empty render.
- **Error handling**: toast on mutation failure; query errors logged.
- **Optimistic updates** where the current UX feels instant (e.g., `markRead`).
- **Rollback**: each sub-batch is one git commit-equivalent change; if 2A breaks, 2B–2D haven't shipped yet.

---

## Out of scope for Phase 2

- SendGrid fanout (Phase 3)
- Google Calendar (Phase 3)
- PDF generation (Phase 3)
- Audit log writes (Phase 4)
- AI extraction (Phase 5)
- Anything outside `/staff/hub/*` and `src/components/internal-hub/*`

---

## Recommended next step

Approve, and I'll start with **Sub-batch 2A (Staff)** — smallest, foundation for the rest. Ship → you verify staff list/profile pages still work → approve 2B.