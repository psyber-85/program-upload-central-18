## Goal
Wire the Internal Hub's Leave/MC calendar sync to the existing **[AIHQ] Team Calendar** found on the linked Google Calendar connection, so admins don't have to pick it manually.

## Discovered calendar
- Name: `[AIHQ] Team Calendar`
- ID: `9a7578ab724e69ac2a18fc646c33c684a7b94a2c420127f1069284936486e78c@group.calendar.google.com`
- Access: writer (sync will work)

## Changes

### 1. Migration — set `ih_calendar_config` row
Update the singleton row (`id = 1`) so sync turns on immediately:
- `calendar_id` = the AIHQ Team Calendar ID above
- `calendar_summary` = `[AIHQ] Team Calendar` (if the column exists; otherwise skipped)
- `enabled` = `true`
- `updated_at` = now()

Uses `INSERT ... ON CONFLICT (id) DO UPDATE` so it works whether or not the row exists yet.

### 2. UI — `CalendarSettings.tsx`
- Show the currently bound calendar name ("[AIHQ] Team Calendar") prominently when set, instead of just the raw ID.
- Keep the "List my calendars" + manual override controls so admins can change it later.
- Add a small "Currently syncing to: [AIHQ] Team Calendar" badge at the top.

### 3. No edge function changes
`ih-calendar-sync` already reads `ih_calendar_config` and posts to whatever `calendar_id` is set — once the migration lands, the next approved Leave/MC will sync to the AIHQ Team Calendar automatically.

## Verification
- After migration: query `ih_calendar_config` to confirm `enabled=true` and the right `calendar_id`.
- Open `/staff/admin/calendar` and confirm the badge shows "[AIHQ] Team Calendar".
- Manually trigger `ih-calendar-sync` against a test approved Leave row and confirm a sync log entry with `status='ok'`.
