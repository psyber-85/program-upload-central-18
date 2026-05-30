# Fix Plan — Audit Gaps (High + Medium)

Scope: address the two non-Low gaps from the Doc 0.1/0.2 audit. Lows (audit change-log stub, offboarding↔tool-removal cross-view) remain deferred. Marketing and main site untouched. Frontend + local data layer only.

## 1. Block inactive staff from the Hub (High — req #5, #44)

**Problem:** `ProtectedRoute` only checks `isAuthenticated`. A staff member flipped to `Inactive` via the Admin Staff Detail page can still load `/staff/*`.

**Fix:**
- In `src/components/internal-hub/InternalHubLayout.tsx`, after `HubContext` resolves `currentStaff`, guard:
  - If `currentStaff?.status === 'Inactive'` → redirect to `/login?reason=inactive` via `<Navigate replace>`.
  - Show a brief toast / inline message on the login page when `reason=inactive` is present (small addition to existing `Login.tsx` only if trivial; otherwise just the redirect).
- Keep the guard inside the Hub layout (not in `ProtectedRoute`) so marketing routes are completely unaffected.
- Dev "view as" switcher on `StaffHome` must respect this too: switching impersonation to an Inactive staff should land on the same redirect. Add the same check at the top of `StaffHome` render.

## 2. Surface onboarding item links (Medium — req covering `ChecklistItem.link`)

**Problem:** `ChecklistItem.link` exists in types but `ChecklistItemRow` never renders or edits it, and seed defaults have none.

**Fix:**
- `src/components/internal-hub/ChecklistItemRow.tsx`:
  - If `item.link` present → render an external-link icon button next to the label opening in new tab (`rel="noopener noreferrer"`).
  - Admin mode (`editable` prop already used in admin tabs): add a small "Edit link" affordance — popover/inline input — that updates `link` via the existing `onUpdate` callback. Staff (read-only) view never shows the edit affordance.
- `src/lib/internal-hub/repos/onboardingRepo.ts`: extend `updateItem` (or equivalent) to accept `{ link?: string | null }` patches if not already supported. No schema change — `link` is already on the type.
- Seed defaults (`src/lib/internal-hub/seed.ts`): add representative links for the 2–3 obvious items (e.g., "Read company handbook", "Set up Notion workspace"), leave the rest null. Keeps the 13-item list intact.
- `AdminStaffDetail` Onboarding tab: no structural change — the row component handles the new UI.

## Out of scope (deferred)

- Audit change-log stub (Low)
- Offboarding ↔ tool-removal cross-view (Low)
- Any backend/Supabase work
- Any change to `/staff/marketing/*`, `ProtectedRoute`, `AuthContext`, or main site

## Acceptance

- Toggling a staff to Inactive in `AdminStaffDetail` → that staff cannot view any `/staff` hub route; they hit `/login`. Marketing routes still work for marketing users.
- Onboarding rows with a `link` show a clickable external-link icon. Admin can add/edit/clear the link per item. Staff sees the link as read-only (clickable, not editable).
- No regression to existing onboarding completion toggling, tool access, offboarding, or Notion unlock logic.
