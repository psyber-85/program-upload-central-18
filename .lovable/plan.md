# /staff Internal Hub — Doc 1.1 + 1.2 Implementation

Frontend only, local-data layer (extends existing `src/lib/internal-hub/`). Marketing portal (`/staff/marketing/*`) and main site untouched. No Supabase, no SendGrid, no real email — broadcast `emailRequired` flag is stored locally only. Builds on the Doc 0.1/0.2 foundation already shipped.

## 1. Data layer (`src/lib/internal-hub/`)

**New types in `types.ts`:**
- `NoticeType`: `'AdminBroadcast' | 'SystemNotification' | 'ResourceUpdate' | 'PayrollNotice' | 'AccessNotice' | 'DeadlineReminder' | 'GeneralAnnouncement'`
- `NoticeImportance`: `'Normal' | 'Important' | 'AcknowledgmentRequired'`
- `NoticeAudience`: `'Everyone' | 'Admin' | 'Training' | 'Solutions' | { kind: 'Individual'; staffId: string }`
- `Notice`: id, title, message, type, importance, audience, createdBy, createdAt, publishedAt, links[], emailRequired, archived, editedAt
- `NoticeReadState`: { noticeId, staffId, readAt }
- `NoticeAck`: { noticeId, staffId, acknowledgedAt }
- `ResourceCategory`: `'YouTubeTraining' | 'NotionKB' | 'CompanyTools' | 'Policies' | 'Benefits' | 'ITSupport' | 'OnboardingMaterials'`
- `Resource`: id, title, category, link, description, audience, owner?, status `'Active' | 'Archived'`, createdAt, updatedAt, isNew?
- `RequestSummary` (preview-only shape): id, type, status, date — backed by empty seed for now
- `PayslipSummary` (preview-only shape): id, month, status `'Ready' | 'NotAvailable'` — empty seed

**New repos under `src/lib/internal-hub/repos/`:**
- `noticeRepo.ts` — CRUD, list by audience for a staff, markRead, acknowledge, archive, edit (title/message/links only), broadcast() helper that sets `emailRequired=true`
- `resourceRepo.ts` — CRUD, list by audience, archive, seed defaults
- `requestSummaryRepo.ts` — listForStaff (returns []), seed-friendly
- `payslipSummaryRepo.ts` — listForStaff (returns []), seed-friendly

**Helpers (`notices.ts`, `resources.ts`):**
- `visibleNoticesFor(staff)` filtering by audience/arm/individual
- `unreadCount`, `ackRequiredPendingCount`, `ackReport(noticeId)` returning {acknowledged: Staff[], pending: Staff[]}
- `latestNotices(limit)`, `latestRequests(staffId, limit=3)`, `latestPayslips(staffId, limit=2)`

**Seed (`seed.ts`):**
- 3 sample notices (1 Normal broadcast read, 1 Important unread, 1 AcknowledgmentRequired pending)
- 10–12 sample resources covering all 7 categories, with IT Support row pointing to `mailto:wani@theaihq.net`
- Empty requests/payslips arrays

## 2. Pages (`src/pages/staff/hub/`)

**Rewrite `StaffHome.tsx` to the Doc 1.1 dashboard model** (order matters):
1. Welcome header — "Welcome, {firstName}" + "Here's what's happening at AIHQ"
2. Operational summary cards (4 cards, role-aware): staff sees MyPendingActions / MyRequests / NoticesAckRequired / PayslipStatus; admin sees PendingApprovals / StaffOnboarding / PayrollStatus / NoticesAckRequired
3. Quick Actions grid (role-aware): staff = Apply Leave, Upload MC, Submit Claim, Apply Training Fund, Insurance/Benefit Request, Other Request, View Payslips, Email IT Support (mailto wani@); admin = Broadcast Notice, Review Approvals, Add Staff, View Payroll, View Finance Snapshot, Manage Resources
4. `<LatestNoticesPreview>` (top 3)
5. `<MyRecentRequestsPreview>` (top 3 + "View all" + empty state w/ Create Request)
6. `<MyPayslipsPreview>` (top 2 + "View all" + empty state)
7. `<SectionsGrid>` — Requests, Resources, My Payslips, Payroll (admin), Staff (admin), Settings (admin). Admin-only cards hidden for staff.
- "You're all caught up." empty state in the action area.
- Move dev impersonation switcher to a discreet footer card so it doesn't pollute the dashboard.

**New pages:**
- `notices/NoticesList.tsx` — full list with filters (unread, ack-required, archived for admin), opens detail
- `notices/NoticeDetail.tsx` — view, mark read on open, Acknowledge button for ack-required, admin Edit/Archive
- `notices/admin/BroadcastForm.tsx` — title, message, audience, importance, requireAck toggle, links[], Publish (creates notice + `emailRequired=true`)
- `notices/admin/AckReport.tsx` — per-notice acknowledged vs pending list
- `resources/ResourcesIndex.tsx` — Start Here (3 buttons: YouTube Training, Notion KB, Company Tools) + categorized list with external-link indicators + IT Support card (mailto + copy)
- `resources/admin/ManageResources.tsx` — add/edit/archive resources
- Stub pages for Quick Actions / Sections destinations not owned by 1.1/1.2 (small "Coming in Card 2/3" placeholders so navigation never lands on 404):
  - `requests/RequestsIndex.tsx` (also handles `?new=true` for Quick Action submissions — read-only stub)
  - `payslips/PayslipsIndex.tsx`
  - `admin/Approvals.tsx`, `admin/Payroll.tsx`, `admin/FinanceSnapshot.tsx`, `admin/Settings.tsx`
  Each stub uses the same layout shell with a clear "owned by later card" message — keeps Home links functional without violating scope.

## 3. Components (`src/components/internal-hub/`)

- `home/WelcomeHeader.tsx`
- `home/SummaryCard.tsx` (title, count/status, optional caption, status dot, optional link) + `SummaryCardGrid.tsx`
- `home/QuickAction.tsx` + `QuickActionsGrid.tsx` (large tap targets, mobile-first)
- `home/LatestNoticesPreview.tsx`
- `home/MyRecentRequestsPreview.tsx` + empty state
- `home/MyPayslipsPreview.tsx` + empty state
- `home/SectionsGrid.tsx` (role-aware tiles)
- `home/AllCaughtUp.tsx`
- `notices/NoticeRow.tsx`, `NoticeImportanceBadge.tsx`, `NoticeTypeBadge.tsx`, `AcknowledgeButton.tsx`
- `resources/StartHereCards.tsx`, `ResourceCard.tsx`, `ExternalLinkIcon.tsx`, `ITSupportCard.tsx`, `NotionKBCard.tsx` (locked/eligible/unlocked using existing `isNotionUnlocked` + `notionUnlockDate`)
- All use existing semantic tokens (`bg-card`, `text-muted-foreground`, `border-border`, etc.). No raw colors.

## 4. Routing (`src/App.tsx`)

Add nested routes under `/staff`:
- `notices`, `notices/:id`, `admin/notices/new` (admin), `admin/notices/:id/ack` (admin)
- `resources`, `admin/resources` (admin)
- `requests`, `payslips` (stubs)
- `admin/approvals`, `admin/payroll`, `admin/finance`, `admin/settings` (stubs, admin-only)

No changes to existing `/`, `/login`, `/reset-password`, TryHire routes, or `/staff/marketing/*`.

## 5. Navigation cleanup (`HubSidebar.tsx`, `HubMobileNav.tsx`)

Per Doc 1.1 §18:
- Header label already says "AIHQ Internal Hub" — keep.
- Sidebar groups: Hub (Home, Notices, Resources, My Requests, My Payslips, My Profile) + Admin (Staff, Broadcast, Approvals, Payroll, Finance Snapshot, Settings) + Other (Marketing — kept as external shortcut clearly labeled).
- No Billing/Payments/Entries/Documents items. "Documents" → "Resources". No revenue/expense/invoice surfaces in /staff.
- Mobile bottom nav: Home / Notices / Resources / Profile (+ admin gets Staff icon).

## 6. Role + visibility rules

- Reuse `canAccessAdminArea(currentStaff)` from `access.ts`.
- Staff-only previews (My Requests, My Payslips) filter by `currentStaff.id`.
- Notice audience filter: Everyone | Admin (admin only) | Training/Solutions (matches `businessArm`) | Individual (matches `staffId`).
- Company Tools resource list: staff sees link + own status; admin sees full per-staff status table (handled inside `ResourcesIndex` admin-aware section).
- Inactive guard from prior card remains in force.

## 7. Out of scope (explicit)

- Real SendGrid / email send — only `emailRequired` flag stored.
- Real request submission workflows (Apply Leave, Upload MC, Submit Claim, etc.) — Quick Actions navigate to stubs.
- Real payroll calculation / payslip generation.
- Notion / Google / YouTube API integration.
- Finance dashboard (revenue/expenses/invoices) — explicitly not reintroduced.
- Marketing portal — zero changes.
- `src/_backup/staff-legacy/` — left alone.

## 8. Acceptance (mapped to docs)

Doc 1.1: Home has welcome → summaries → quick actions → notices → requests → payslips → sections in that order. Staff/admin Home differ correctly. Latest 3 requests, latest 1–2 payslips. "You're all caught up." empty state present. No revenue/expense/billing/payments on Home or in nav. "Documents" gone, "Resources" present. Mobile uses bottom nav + drawer, not cramped desktop sidebar.

Doc 1.2: 7 notice types, 3 importance levels. Admin broadcast creates notice + `emailRequired=true` + log entry for all importance levels including Normal. Staff cannot broadcast. Notices support links only, no file uploads. Read/unread per recipient. AckRequired notices stay pending until acknowledged or admin-archived. Admin ack report shows acknowledged vs pending. Notice edit limited (title/message/links). Archive instead of hard delete. Resources admin-editable, link-based, categorized; external links open in new tab with indicator. Start Here shows 3 launchpad buttons. Notion KB shows locked/eligible/unlocked using existing lifecycle. Company Tools never exposes passwords/credentials. IT Support is mailto `wani@theaihq.net` only.

## 9. Memory updates (after build)

- `mem://internal-hub/home-doc-1.1` — Home dashboard order, role-aware cards, finance-cleanup rule
- `mem://internal-hub/notices-resources-doc-1.2` — broadcast = in-app + emailRequired, ack rules, resource categories, Start Here, IT email
- Update `mem://index.md` Core: add "All admin broadcasts set emailRequired (incl. Normal). Notices archived not deleted. IT support = mailto wani@theaihq.net only."
