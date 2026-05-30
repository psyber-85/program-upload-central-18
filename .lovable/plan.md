# Plan: New /staff Internal Hub — Doc 0.1 + Doc 0.2 (frontend-first foundation)

## Scope
Build the foundation of the new Staff portal at `/staff/*` per Doc 0.1 (roles, profiles, auth shell, privacy) and Doc 0.2 (onboarding checklist, tool access, Notion unlock, welcome email event, deactivation, offboarding checklist). Frontend-only, local data layer.

## Hard guardrails (unchanged)
- TryHire (`/`, `/interest`, `/thanks`, `/privacy`) — untouched.
- `/staff/marketing/*` and everything under `src/components/marketing/`, `src/components/registration/`, `src/components/crm/`, `src/pages/staff/marketing/`, `src/pages/BirthdayDashboard.tsx`, `src/pages/RegisterTracker.tsx`, `src/pages/CRMTracker.tsx`, `src/pages/Index.tsx` — untouched.
- `/login`, `/reset-password`, `AuthProvider`, `ProtectedRoute`, `AuthContext` — untouched (the new portal reuses them as-is so marketing keeps working).
- `src/_backup/staff-legacy/` — left alone.
- No DB, no Supabase migration, no edge function, no SendGrid in this card (welcome email is a local *event/status* per Doc 0.2 §16).

## Anti-goals (explicit from the docs)
No HRMS, no LMS, no password storage, no staff directory, no self-edit of staff profile, no automated Notion/Google provisioning, no payroll calculation, no request workflows. Those belong to later cards.

---

## Architecture

### 1. Local data layer — `src/lib/internal-hub/`
Repository pattern so Card 4 can later swap to Supabase without rewriting pages.

```
src/lib/internal-hub/
├── types.ts                  # StaffProfile, OnboardingChecklist, ToolAccessItem, OffboardingChecklist, WelcomeEmailEvent, enums
├── seed.ts                   # 1 admin, 2 staff (1 Training, 1 Solutions), realistic dates, no passwords
├── storage.ts                # tiny localStorage JSON helper (namespaced "aihq-hub:")
├── repos/
│   ├── staffRepo.ts          # list/get/create/update/deactivate/hardDelete (mistake-only)
│   ├── onboardingRepo.ts     # checklist CRUD + staff self-check + admin override
│   ├── toolAccessRepo.ts     # tool access items (statuses: Not Needed/Pending/Granted/Removed/Needs Review)
│   ├── offboardingRepo.ts    # offboarding checklist
│   └── welcomeEmailRepo.ts   # queued/sent/resend events
├── access.ts                 # isAdmin, isStaff, isActiveStaff, canViewStaffProfile, canEditStaffProfile, canAccessAdminArea
├── lifecycle.ts              # initializeOnboarding(staff), buildDefaultToolChecklist(), buildDefaultOffboardingChecklist(), notionUnlockDate(joinDate)
└── HubContext.tsx            # React context exposing current staff profile (via AuthContext.user.id) + repo accessors
```

**Type model** (Doc 0.1 §11, Doc 0.2 §9, §12, §14, §22):
- `StaffProfile`: id, fullName, email, role (`'Admin'|'Staff'`), jobTitle, businessArm (`'Training'|'Solutions'|'Admin/General'`), joinDate, status (`'Active'|'Inactive'`), baseSalary, epfRate, socsoRate, insuranceCovered, insuranceStartDate?, insurancePolicyLink?, adminNotes?, createdAt, updatedAt.
- `OnboardingChecklist`: staffId, items[] (key, label, owner: `'admin'|'staff'`, status: `'pending'|'staff-checked'|'admin-verified'|'complete'`, completedAt?, verifiedBy?). Default items per Doc 0.2 §9.
- `ToolAccessItem`: staffId, tool (`'GoogleEmail'|'GoogleDrive'|'Notion'|'ChatGPT'|'Gemini'|'YouTubeTraining'|'AIHQSocial'|'Other'`), link?, owner?, status (`'NotNeeded'|'Pending'|'Granted'|'Removed'|'NeedsReview'`), usageNote?, offboardingNote?. **Never** a password field.
- `OffboardingChecklist`: staffId, items[] mirroring Doc 0.2 §22 (disable login, remove Notion, …, final claims check, final payroll check, mark complete).
- `WelcomeEmailEvent`: staffId, status (`'queued'|'sent'|'resent'|'failed'`), queuedAt, sentAt?.
- `OnboardingState` derived: `'NotStarted'|'InProgress'|'Complete'` (separate from Active/Inactive).

**Notion unlock**: `notionUnlockDate(joinDate) = joinDate + 1 month` (Doc 0.2 §15). Used by UI only — no API call.

### 2. Route map (`src/App.tsx`)
Replace the `/staff` placeholder with a protected nested layout. **Keep the `/staff/marketing` block exactly as-is** so React Router still matches it first.

```
/staff                              → InternalHubLayout (ProtectedRoute)
  index                             → StaffHome
  /staff/profile                    → MyProfile (read-only, staff-safe fields)
  /staff/admin/staff                → AdminStaffList         (requireAdmin)
  /staff/admin/staff/new            → AdminAddStaff          (requireAdmin)
  /staff/admin/staff/:id            → AdminStaffDetail       (requireAdmin)
      tabs: Profile | Onboarding | Tool Access | Offboarding
  /staff/marketing/*                → unchanged
```

`requireAdmin` already exists on `ProtectedRoute` and currently redirects non-admins to `/staff` — keep that behavior.

### 3. UI components — `src/components/internal-hub/`
```
InternalHubLayout.tsx         # sidebar + outlet, mobile-first, role-aware
HubSidebar.tsx                # nav items filtered by role (Home, My Profile [staff]; Staff Management [admin])
HubMobileNav.tsx              # bottom nav for mobile
StaffStatusBadge.tsx          # Active/Inactive pill (design tokens)
OnboardingStateBadge.tsx      # NotStarted/InProgress/Complete
ChecklistItemRow.tsx          # shared row UI used by Onboarding & Offboarding tabs
ToolAccessRow.tsx             # tool row with status select (no password field)
NotionUnlockBanner.tsx        # locked/eligible/granted states + unlock date
WelcomeEmailStatus.tsx        # queued/sent + Resend button (local toast only)
DeactivateStaffDialog.tsx     # confirm + creates offboarding checklist
HardDeleteGuardDialog.tsx     # only enabled if zero activity
StaffFormFields.tsx           # shared create/edit fields (admin-only)
```

### 4. Pages — `src/pages/staff/hub/`
```
StaffHome.tsx                 # greeting, onboarding progress (count only, no gamification), Notion unlock banner, links to assigned materials
MyProfile.tsx                 # read-only: name, email, jobTitle, businessArm, joinDate, status, insuranceCovered. NEVER salary/EPF/SOCSO/adminNotes.
admin/AdminStaffList.tsx      # Active list + Inactive (archive) toggle; "Add staff" button
admin/AdminAddStaff.tsx       # form per Doc 0.2 §6; on submit -> lifecycle.initializeOnboarding + welcomeEmailRepo.queue
admin/AdminStaffDetail.tsx    # tabs:
  - Profile (full fields, edit)
  - Onboarding (default 13 items, staff self-check vs admin verify)
  - Tool Access (8 tools + Other, statuses, no passwords)
  - Offboarding (visible when Inactive OR after Deactivate clicked; checklist incl. final claims & payroll check)
StaffComingSoon.tsx           # delete (replaced by real Home)
```

### 5. Access enforcement (Doc 0.1 §23, §25)
- Sidebar items filtered via `access.ts` helpers; admin routes also guarded by `<ProtectedRoute requireAdmin>`.
- `MyProfile` is rendered from helpers, never reads salary fields.
- `AdminStaffDetail` writes go through repos that enforce: staff cannot self-edit, hard delete blocked when activity exists.

### 6. Design system
All Tailwind via semantic tokens from `index.css` / `tailwind.config.ts`. Use existing shadcn components (Card, Tabs, Table, Select, Dialog, Badge, Button). No new colors.

---

## Acceptance (mapped to docs)
- Admin can create staff → becomes Active with onboarding `InProgress` (0.2 §5, §19).
- Onboarding checklist auto-created with 13 default items (0.2 §9).
- Tool access checklist auto-created for the 8 tools (0.2 §12).
- Notion shows locked with unlock date until `joinDate + 1 month` (0.2 §15).
- Welcome email status visible + Resend button; no real send (0.2 §16).
- Staff `MyProfile` never shows salary/EPF/SOCSO/adminNotes (0.1 §15, §18).
- Staff cannot edit own profile (0.1 §16).
- No staff directory for staff role (0.1 §17).
- Deactivate flips status to Inactive, hides from active list, surfaces offboarding checklist incl. final claims & final payroll items (0.2 §20, §22, §24).
- Hard-delete only enabled when zero activity (0.1 §26, 0.2 §21).
- No password / credential fields anywhere (0.1, 0.2 §13).
- `/staff/marketing/*` and TryHire load unchanged.

---

## Out of scope (defer)
- Real Supabase tables, RLS, audit log → Card 4.
- Real SendGrid send → Card 4.
- Requests / leave / MC / claims / training fund → Card 2.
- Payroll calculation / payslip rendering → Card 3.
- Notices, Resources page content management → Card 1.

---

## Memory updates after build
- `mem://internal-hub/foundation-doc-0.1` — role model, profile field list, visibility rules, local-data-layer rule.
- `mem://internal-hub/lifecycle-doc-0.2` — checklist defaults, tool list, Notion 1-month unlock, no-password rule, hard-delete boundary.
- Update `mem://index.md` Core: add "Internal Hub: Admin/Staff only; no passwords stored; staff profile read-only for staff; Notion unlocks at joinDate+1mo."
