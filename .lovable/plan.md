## Goal
Temporarily hide the "CRM Campaign Tracker" entry from the marketing portal UI for all users, without deleting the underlying page or route (so it can be re-enabled easily later).

## Changes

1. **`src/components/marketing/MarketingNavigation.tsx`**
   - Comment out (or conditionally render `false`) the nav link to `/staff/marketing/crm-tracker` ("CRM Campaign Tracker"), so it no longer appears in the marketing top nav.

2. **`src/pages/staff/marketing/MarketingDashboard.tsx`**
   - Remove the "CRM Campaign Tracker" card from the `tools` array (comment it out) so the dashboard tile grid no longer shows it.

3. **`src/components/staff/StaffNavigation.tsx`**
   - Also hide the "CRM Campaign Tracker" link here for consistency across staff navigation.

## What stays untouched
- The route, `CRMTracker` page, CRM context, components, and Supabase logic remain intact.
- No backend/database changes.
- Direct URL access still works (just not linked in UI) — let me know if you'd also like the route gated/redirected.

## Re-enabling later
Uncomment the nav entries / dashboard tile.
