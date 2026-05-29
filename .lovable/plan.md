## Goal
Let users choose how many prospects to show per page (20 / 50 / 100) in the Prospect List table inside Program Details, instead of being locked to a fixed size.

## Context found in codebase
- The table lives in `src/components/ProspectTable.tsx`, rendered by `src/components/registration/ProgramCard.tsx` under the "Prospect List" tab.
- Page size is currently hardcoded: `const [prospectsPerPage] = useState(10)` (line 63). The "Showing 20 of 20" text in the screenshot is the filtered/total count — not the page size; the actual page slice is 10. The new default will be 20 to match user expectation.
- Pagination math (`totalPages`, `startIndex`, `currentProspects`) already keys off `prospectsPerPage`, so no algorithmic changes are needed.
- A separate `useEffect` already resets `currentPage` to 1 when filters change — we'll extend it to also reset when page size changes.
- The component already imports shadcn `Select`, used for the status filter, so we'll reuse the same component for visual consistency.

## Changes (single file: `src/components/ProspectTable.tsx`)

1. Convert page size to stateful: `const [prospectsPerPage, setProspectsPerPage] = useState(20)`.
2. Add a small "Rows per page" `Select` (options: 20, 50, 100) placed next to the existing pagination controls at the bottom of the table. Inline, right-aligned with the page numbers, using the same `text-sm text-gray-600` styling as the "Showing X of Y" helper text so it visually belongs to the table chrome.
3. On change, reset `currentPage` to 1 (add `prospectsPerPage` to the existing filter-reset `useEffect`).
4. Keep the "Showing X of Y prospects" summary text — it already reflects filtered totals, not page size, so it stays accurate.

## Out of scope (intentionally untouched)
- Data fetching: prospects continue to load all-at-once per program (client-side pagination, same as today). No backend / Supabase changes.
- Sorting, filtering, search, real-time subscriptions, column toggle, modals, Add Prospect, Bulk Upload tab.
- Other tables elsewhere in the app — only the Program Details → Prospect List table per your request.

## UX notes
- Default 20 matches what the user currently perceives, so existing users see no behavior change unless they opt in.
- Selector placed at the bottom near pagination (standard table convention), not at the top, to avoid crowding the search/filter row.
- If a user picks a size larger than total filtered rows, pagination simply collapses to a single page — no edge-case handling needed beyond the existing `totalPages` guard.
