# Phase 2 — Sub-batch 2B: Notices + Resources → Supabase

Migrate `noticeRepo` and `resourceRepo` from localStorage to `ih_notices` / `ih_resources` (+ `ih_notice_reads`, `ih_notice_acks`). RLS already enforces audience/active-staff/archived filtering, so the client just reads/writes.

## Files to rewrite

### `src/lib/internal-hub/repos/noticeRepo.ts` (full rewrite, async)
Maps app types ↔ DB columns:
- `message` ↔ `body`
- `publishedAt` ← `created_at`
- `archived` ← `archived_at !== null`
- Importance: app `AcknowledgmentRequired` → DB `importance='Critical' + ack_required=true`; `Important`→`Important`; `Normal`→`Normal`.
- Audience: app `Everyone`/`Admin`/`Arm:Admin/General` → DB `Everyone`; `Arm:Training`→`Training`; `Arm:Solutions`→`Solutions`; `Individual`→`Individual + audience_staff_id`.
- DB has no `type`/`links`/`editedAt`/broadcast log → defaulted to `'AdminBroadcast'`/`[]`/`undefined`; `listBroadcastLog()`/`broadcastLogFor()` return empty (no-op).
- Methods become async: `list`, `get`, `visibleFor`, `broadcast`, `edit`, `archive`, `unarchive`, `markRead`, `unreadCount`, `acknowledge`, `ackBy`, `ackRequiredPendingFor`, `ackReport`. Plus new bulk helpers `listReadsForStaff(staffId)` and `listAcksForStaff(staffId)` that return `Set`/`Map` for efficient per-row checks in lists.

### `src/lib/internal-hub/repos/resourceRepo.ts` (full rewrite, async)
- `link` ↔ `url`; `status` ↔ `archived_at`.
- Audience same mapping as notices.
- Drops in-app-only fields `owner`/`isNew` (not in DB); `external` derived from `url.startsWith('http')`.
- Methods become async: `list`, `visibleFor`, `create`, `update`, `archive`, `unarchive`.

## Callsites to update (8 files)

All switch to TanStack Query for reads, async mutations:

1. **`src/pages/staff/hub/notices/NoticesList.tsx`** — `useQuery(['ih-notices', filter])`, `useQuery(['ih-notice-reads', staffId])`, `useQuery(['ih-notice-acks', staffId])`. Per-row read/ack checks against Sets.
2. **`src/pages/staff/hub/notices/NoticeDetail.tsx`** — `useQuery(['ih-notice', id])`, async `markRead` on mount via `useMutation`, `edit`/`archive`/`unarchive`/`acknowledge` as `useMutation` calls. `invalidateQueries` on success.
3. **`src/pages/staff/hub/notices/admin/BroadcastForm.tsx`** — `useMutation` for `broadcast`. Links field stays in UI but is ignored on submit (with a tooltip note added).
4. **`src/pages/staff/hub/notices/admin/AckReport.tsx`** — already uses `useQuery` for staff; switch `noticeRepo.get` + `ackReport` to async `useQuery`s. Drop the broadcast-log card (no DB table).
5. **`src/pages/staff/hub/resources/ResourcesIndex.tsx`** — `useQuery(['ih-resources-visible', staffId])`.
6. **`src/pages/staff/hub/resources/admin/ManageResources.tsx`** — `useQuery(['ih-resources-all'])`, mutations for create/update/archive/unarchive.
7. **`src/pages/staff/hub/StaffHome.tsx`** — wrap notices preview, unread count, and ack-pending count in `useQuery`. Pass `readSet` down to `LatestNoticesPreview`.
8. **`src/components/internal-hub/home/LatestNoticesPreview.tsx`** — accept `readSet: Set<string>` instead of `isReadByMe` callback (sync), so it doesn't need to call the repo.

## Compatibility shim

- `noticeRepo` no longer imported from `payrollRepo` (verified earlier); no other repos depend on it.
- `audienceMatches` stays exported (used by `ackReport` and any future callers).

## Loading + error UX

- Replace empty render with skeleton/spinner blocks.
- Toast on mutation failure with `error.message`.
- `markRead` and `acknowledge` swallow duplicate-key errors (composite PK collisions).

## Out of scope (deferred)

- SendGrid fanout edge function (Phase 3).
- Broadcast log table / audit log (Phase 4).
- `type`/`links` columns in `ih_notices` (would require a migration — owners haven't requested; UI gracefully omits).

## Verification

- TypeScript build clean.
- Manually exercise: list notices, mark read, acknowledge, broadcast (admin), archive/restore, ack report, manage resources (add/edit/archive).
- `mem://index.md` requires no update — Doc 1.2 rules unchanged.

Ready to implement on approval.
