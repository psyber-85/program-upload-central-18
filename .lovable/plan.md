## Goal
Let platform users tag each participant row in the register tracker with one of five colors, purely for visual differentiation. Color is per-prospect, persisted, and visible to anyone viewing the tracker.

## Scope (only this)
- `staff/marketing/register-tracker` prospect table only.
- No changes to HR notification flow, program links/pricing, or any other area.

## Color palette (fixed, 5 options + "none")
1. None (default — no tint)
2. Red
3. Amber
4. Green
5. Blue
6. Purple

Rendered as soft background tints via semantic tokens (light bg + subtle left border), so they stay readable in both themes and don't clash with status badges.

## UX
- In `ProspectTable.tsx`, add a small color swatch cell (leftmost or next to name) on each row.
- Click swatch → popover with the 6 swatches + a "Clear" option. Selecting one updates the row immediately (optimistic) and persists.
- Row background gets the tint; keeps existing hover/status styling intact.
- Mobile: same swatch, tappable.

## Data
Add a nullable `row_color` text column on `prospects` (values: `red | amber | green | blue | purple | null`). Constrained via CHECK. Realtime channel already subscribed to `prospects`, so other viewers update live.

## Technical details
- Migration: `ALTER TABLE public.prospects ADD COLUMN row_color text CHECK (row_color IN ('red','amber','green','blue','purple'))`.
- Types: extend `Prospect` in `src/lib/registration/types.ts` with `row_color?: string | null`.
- New component: `src/components/registration/RowColorPicker.tsx` — popover with 6 swatches, calls `supabase.from('prospects').update({ row_color }).eq('id', id)`.
- Tint styles: map color key → `bg-*/10` + `border-l-4 border-*` using semantic-friendly Tailwind classes (defined in one small helper, not hardcoded per row).
- `ProspectTable.tsx`: add swatch column, apply row tint class based on `prospect.row_color`.
- No changes to `RegistrationContext`, edge functions, or other modals.

## Out of scope
Filtering/sorting by color, bulk color assignment, color legend/labels, custom colors, per-user (viewer-specific) colors.
