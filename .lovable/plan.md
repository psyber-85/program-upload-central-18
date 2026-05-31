## Fix: calendar sync "timeRangeEmpty" when end_date < start_date

### Root cause
Pang's leave: `start_date=2026-06-01`, `end_date=2026-05-01` (end before start). The all-day event the sync builds becomes `start.date=2026-06-01`, `end.date=2026-05-02`. Google rejects with `timeRangeEmpty` (labeled `timeMax` for any empty range).

The form does not validate that end ≥ start, so an out-of-order range got persisted and approved.

### Edits

**1. `src/pages/staff/hub/requests/RequestsIndex.tsx` — block submission with invalid range**
- In the submit handler (around line 51), add: `if (endDate && endDate < startDate) { toast.error('End date cannot be before start date.'); return; }`.

**2. `supabase/functions/ih-calendar-sync/index.ts` — defensive clamp in `buildEventPayload`**
- For the full-day branch (line ~46): if `endRaw < startDate`, set `endRaw = startDate` so the event becomes a single-day all-day event instead of failing. Belt-and-braces — UI is the primary guard.

**3. One-off data fix for Pang's stuck request**
- Update `ih_requests.payload` for `c453fcea-e561-4c20-9dfa-f15da6a78a9a` so `end_date = '2026-06-01'` (matching the start, since the original intent isn't recoverable — admin can amend later if needed). Then re-invoke `ih-calendar-sync` for that request via the System Issues retry path so the event syncs and `gcal_sync_error` clears.

### Out of scope
- No schema/RLS changes.
- No new audit actions (existing request audit covers it).
- No changes to half-day branch — it already uses a single date.

### Expected outcome
- Future leave requests with end < start are blocked at the form.
- Edge function no longer 400s on out-of-order ranges; it falls back to a single-day event.
- Pang's stuck request syncs successfully after the data fix + retry.
