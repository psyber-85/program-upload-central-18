
# Patch 1.3 — Home & Operating Surface Completion

Pure presentation/aggregation patch. No DB schema changes, no business logic changes. All data is read from existing repos. Edits stay in `src/pages/staff/hub` and `src/components/internal-hub/home` + a small aggregator module.

## Scope check (what stays untouched)
- Request/leave/claim/training workflows
- Payroll calc & finalize logic
- Payslip format & PDF
- RLS / backend / edge functions
- `/staff/marketing` and all marketing components
- Existing summary card destinations that already work

## Gap analysis vs Patch §29 acceptance

| §29 item | Current state | Action |
| --- | --- | --- |
| Staff My Pending Items preview | ❌ missing | build preview + full page |
| Acknowledgment-required as pending | partial (badge only) | feed into pending aggregator |
| Needs-Correction requests as pending | partial (in recent list) | promote to pending + visual badge |
| Onboarding tasks as pending (staff) | ❌ | aggregate from `onboardingRepo` |
| Payslip-ready as pending/status | partial (summary card) | add pending entry when latest unread |
| Admin Workbench preview + page | ❌ | build both |
| Pending approvals, MC, claims, training etc. in workbench | ❌ aggregator | aggregate from `requestSummaryRepo`/staff repos |
| Onboarding/offboarding pending (admin) | partial (count card) | itemized in workbench |
| Notion access eligible | ❌ | flag from `lifecycle` |
| Payroll review/finalization reminders | partial (idempotent reminder ran) | surface in workbench |
| System Issues for admin | route exists, not on Home | surface unresolved on Home + workbench |
| Section cards with status | ❌ plain tiles | add lightweight status badges |
| Coming-later/stub control | ❌ inconsistent (`Stubs.tsx`) | one `ComingLater` component + replace Approvals stub w/ workbench filter |
| Mobile priority order | ❌ summary cards first | reorder: Pending → Quick Actions → Summary → Notices → Requests → Payslips → Sections |
| Empty states calm copy | partial | standard empty strings |
| Privacy boundary | already enforced by repos | verify in aggregator, no cross-staff reads for non-admin |

## New files

```
src/lib/internal-hub/workbench/
  pendingItems.ts       // staff aggregator → PendingItem[]
  adminWorkbench.ts     // admin aggregator → WorkbenchItem[]
  types.ts              // PendingItem, WorkbenchItem, ActionKind

src/components/internal-hub/home/
  PendingItemsPreview.tsx
  AdminWorkbenchPreview.tsx
  SectionTile.tsx       // (refactor of SectionsGrid tile w/ status slot)

src/components/internal-hub/ComingLater.tsx   // §22 pattern

src/pages/staff/hub/
  MyPendingItems.tsx    // full page
  admin/AdminWorkbench.tsx  // full page with §12 filters
```

## Edited files

- `src/pages/staff/hub/StaffHome.tsx` — reorder sections per §24/§25; insert PendingItems/Workbench previews; pass section statuses.
- `src/components/internal-hub/home/SectionsGrid.tsx` — accept status badges (unread notices, ack count, pending requests, payroll status, onboarding pending count).
- `src/components/internal-hub/home/MyRecentRequestsPreview.tsx` — clearer Needs Correction badge + "Fix Request" CTA (§18).
- `src/components/internal-hub/home/MyPayslipsPreview.tsx` — show "View Payslip" CTA + latest-month caption (§19).
- `src/pages/staff/hub/admin/Stubs.tsx` — remove `Approvals` stub; route `/staff/admin/approvals` to the new `AdminWorkbench` page with `?type=Requests` filter.
- `src/App.tsx` — add routes `/staff/pending`, `/staff/admin/workbench`; repoint `/staff/admin/approvals` to AdminWorkbench.

## Aggregator behavior

### `pendingItems.ts` (staff only)
Pulls in parallel via React Query inside the page; returns prioritized list:

1. Ack-required notices not yet acknowledged → action `Acknowledge` → `/staff/notices/:id`
2. Own requests in `NeedsCorrection` → `Fix Request` → `/staff/requests/:id`
3. Latest payslip not yet viewed (Patch flag `lastViewedAt` already exists on payslip repo if present, else just "available") → `View Payslip`
4. Onboarding starter tasks incomplete (own checklist) → `Complete Task` → `/staff/profile`
5. Notion access eligible but not unlocked → `View Resource` → `/staff/resources`
6. Approved/Rejected request outcome not yet viewed → `View Outcome`

Resolution: items are derived state — when underlying repo state changes (ack, status, view), item disappears on next query.

### `adminWorkbench.ts` (admin only)
Combines:
- pending approvals (`requestSummaryRepo.listPendingApprovals()` — wrap existing count call by listing if needed; if not present, reuse `requestSummaryRepo` list w/ filter)
- staff onboarding/offboarding incomplete
- Notion access eligible but not granted
- payroll status: `Draft`/`Ready` for current month → `Review Payroll`
- finalization reminder (after the 25th) — reuse `payrollRepo.ensureReminderForMonth`
- unresolved `systemIssuesRepo.listSystemIssues({ status: 'open' })`
- unacknowledged notice summary (existing notice repo aggregate)

Each item: `{ id, type, title, staffName?, recordRef?, priority, createdAt, status, primaryAction, href }`.

## Pages

### `MyPendingItems.tsx`
- Header + count
- List grouped by type with primary-action buttons
- Empty state: "You're all caught up."

### `AdminWorkbench.tsx`
- Filters (§12): item type, status, staff member, priority, source module — implemented as `Select` + chip toggles, URL-synced via `useSearchParams`
- Table/list of items with primary actions
- Empty state per filter

## Home layout (final order)

Mobile (default flex order):
1. Pending Items / Admin Workbench preview
2. Quick Actions
3. Summary cards
4. Latest Notices
5. Recent Requests
6. Payslips
7. Sections

Desktop (`lg:`): summary cards row across top, pending/workbench preview prominent left column, others fill — achieved via `order-*` Tailwind utilities, not duplicate trees.

## Coming-later component (§22)
`<ComingLater feature="..." purpose="..." plannedFor="..." />` — used only when the user benefits from knowing; not used to mask broken buttons. No new broken buttons are introduced.

## Acceptance check after build
Manual click-through:
- Each summary card routes correctly
- Pending preview "Fix Request" / "Acknowledge" / "View Payslip" all open right record
- Admin workbench preview links to full workbench with prefilter
- Section tiles show counts where data exists, hide silently when zero
- Mobile viewport (462px) shows Pending block first

No build, typecheck, or DB migration required.
