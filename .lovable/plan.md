## Fix Plan — Doc 1.2 §15 broadcast log entry (Medium)

**Gap:** `noticeRepo.broadcast` sets `emailRequired=true` but does not persist a log entry, so future email-fanout work has no auditable trail.

### Changes

1. **`src/lib/internal-hub/types.ts`** — Add `BroadcastLogEntry` type:
   ```ts
   export interface BroadcastLogEntry {
     id: string;
     noticeId: string;
     createdBy: string;     // staffId
     createdAt: string;
     audience: NoticeAudience;
     recipientCount: number; // snapshot at broadcast time
     emailRequired: true;
     emailSentAt?: string;   // reserved for future integration
   }
   ```

2. **`src/lib/internal-hub/repos/noticeRepo.ts`**
   - New localStorage key `notice-broadcast-log`.
   - In `broadcast(input)`, after saving the notice, compute recipient snapshot via `staffRepo.list()` filtered by `status==='Active'` + `audienceMatches`, then append a `BroadcastLogEntry`.
   - Add `listBroadcastLog()` and `broadcastLogFor(noticeId)` accessors.
   - To avoid a circular import, lazy-import `staffRepo` inside the function.

3. **`src/pages/staff/hub/notices/admin/AckReport.tsx`** — Surface the log row at the top: "Broadcast sent {when} by {who} → {N} recipients · Email queued (pending integration)". Read-only, no UI controls.

### Out of scope
- No real email send (integration work, per Doc 1.2).
- No new routes, no changes to BroadcastForm UI, no schema/RLS work (local-only).
- No edits to marketing portal or main site.

### Verification
- Broadcast a notice from `/staff/admin/notices/new` → confirm `localStorage['notice-broadcast-log']` contains the entry.
- Open AckReport for that notice → log line renders.
- Existing audit requirement #15 flips Partial → Pass (compliance 31/31).
