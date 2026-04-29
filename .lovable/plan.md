## Goal

Make `birth_date` optional in the Birthday bulk upload by auto-deriving it from the Malaysian NRIC (first 6 digits = YYMMDD) when not provided. If both are present, prefer the explicit `birth_date` and warn on mismatch.

## How NRIC → Date Works

Malaysian NRIC format: `YYMMDD-PB-####` (12 digits, dashes optional).
- First 2 digits = year (YY)
- Next 2 = month (MM, 01–12)
- Next 2 = day (DD, 01–31)

Year disambiguation (no century in NRIC):
- Build candidate `19YY` and `20YY`.
- Pick the one that yields an age between 0 and 100 vs today.
- If both valid (rare), prefer `19YY` (older — typical for working professionals).
- If neither valid → row error.

Validation:
- Strip non-digits, require ≥ 6 digits.
- Validate MM 1–12 and DD valid for that month/year (handles Feb 29 leap years).

## Changes

### `src/components/marketing/BirthdayBulkUploadCard.tsx`

1. Add helper `deriveBirthFromNRIC(nric: string): string | null` returning `YYYY-MM-DD` or null.
2. In row parsing:
   - Try `normalizeDate(r.birth_date)` first.
   - If null, fall back to `deriveBirthFromNRIC(nric)`.
   - If explicit date AND NRIC-derived date both exist and differ → still accept the explicit date but record a soft warning (shown in preview, not blocking).
   - Only error if BOTH are missing/invalid: `"birth_date missing and could not derive from NRIC"`.
3. Mark `birth_date` as optional in:
   - `REQUIRED` array (remove `birth_date`)
   - Help text under the file input ("birth_date optional if NRIC is a valid Malaysian IC")
   - Template CSV: keep the column but add a second sample row showing NRIC-only (empty birth_date).
4. Preview section: show a small badge/note when a row's date was auto-derived (`• Jane Doe — ... — 1990-01-01 (from NRIC)`).
5. Track counts in the post-parse toast: `"X valid (Y auto-derived from NRIC), Z errors"`.

### No backend / DB changes

- `participants_bday_duplicate` schema unchanged.
- `birth_date` and `birth_mmdd` are still written for every inserted row (derived value used when NRIC-resolved).
- Edge functions (`birthday`, `send-remaining`) keep working unchanged since they read `birth_mmdd`.

## Edge Cases Handled

- NRIC with dashes / spaces (`900101-01-5555`) — stripped before parsing.
- Invalid month/day (e.g. `991332...`) → row error if no explicit `birth_date`.
- Non-Malaysian / passport IDs (letters, < 6 digits) → row error if no explicit `birth_date`.
- Future-dated NRIC → rejected via age range check.

## Out of Scope

- Gender / state extraction from NRIC (not needed by the birthday system).
- Backfilling birthdays for existing rows already in the DB (separate task if needed).
