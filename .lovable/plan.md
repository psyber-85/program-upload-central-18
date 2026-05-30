# Plan: Backup existing /staff frontend (preserve marketing)

## Scope
Front-end only. Marketing portal (`/staff/marketing/*` and everything under `src/components/marketing/`, `src/pages/staff/marketing/`) is **untouched**. TryHire, auth, and all other areas are **untouched**. No backend, DB, or edge-function changes.

## What gets moved to backup
Move (not delete) the following into a new `src/_backup/staff-legacy/` directory, preserving relative paths so re-introduction is trivial:

**Pages**
- `src/pages/staff/StaffHome.tsx`
- `src/pages/staff/StaffRequests.tsx`
- `src/pages/staff/NewRequest.tsx`
- `src/pages/staff/RequestDetail.tsx`
- `src/pages/staff/StaffDocs.tsx`
- `src/pages/staff/StaffPayslips.tsx`
- `src/pages/staff/PayslipDetail.tsx`
- `src/pages/staff/MyEntries.tsx`
- `src/pages/staff/StaffDashboard.tsx`
- entire `src/pages/staff/admin/` (Payroll, PayrollRunDetail, Billing, Payments, Settings)

**Staff-only components** (marketing components live in `src/components/marketing/` — not touched)
- `src/components/staff/PortalLayout.tsx`
- `src/components/staff/StaffSidebar.tsx`
- `src/components/staff/StaffNavigation.tsx`
- `src/components/staff/StaffLayout.tsx`
- `src/components/staff/PortalNavigation.tsx`
- `src/components/staff/MobileBottomNav.tsx`
- `src/components/staff/RoleSwitcher.tsx`
- `src/components/staff/FileUpload.tsx`

**Kept in place** (still used by marketing or other areas):
- `src/components/staff/ProtectedRoute.tsx` — used by `/staff/marketing` route guard
- `src/components/staff/ErrorBoundary.tsx` — generic, may be reused

## Routing changes (`src/App.tsx`)
- Remove all imports for the moved pages and `PortalLayout`.
- Remove the entire `<Route path="/staff" element={<PortalLayout/>}>...</Route>` block (lines 67–106) including admin sub-routes.
- Add a single placeholder route so visiting `/staff` doesn't 404 unexpectedly:
  ```tsx
  <Route path="/staff" element={<StaffComingSoon />} />
  ```
- **Keep** the `/staff/marketing/*` block exactly as-is (lines 109–119). Because React Router matches more specific paths first, the marketing nested routes continue to work.

## New placeholder page
- `src/pages/staff/StaffComingSoon.tsx` — minimal page using existing design tokens: centered card, heading "Staff Portal", body "This portal is being revamped. The Marketing tools remain available at /staff/marketing.", and a link button to `/staff/marketing`.

## What stays exactly the same
- `/staff/marketing` and every page/component under it (MarketingLayout, MarketingNavigation, MarketingDashboard, BirthdayDashboard, RegisterTracker, CRMTracker, Participant Manager, all `src/components/marketing/*`, all `src/components/registration/*`, all `src/components/crm/*`, `ProspectTable`, etc.)
- TryHire pages, Login, ResetPassword, NotFound
- All backend (`supabase/`), DAL, contexts (`AuthContext` is still used by marketing)
- `tailwind.config.ts`, `index.css`, design tokens

## Verification
After the move:
1. Build passes (no dangling imports).
2. `/staff` renders the placeholder.
3. `/staff/marketing` and every marketing sub-route load unchanged.
4. `/` (TryHire) and `/login` unchanged.

## Out of scope
- The revamp itself (new pages, new IA, new design) — that comes next, separately.
- Any DB / Supabase changes.
- Touching marketing code in any way.
