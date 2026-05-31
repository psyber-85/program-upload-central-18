## Doc 4.3 §6 — Audit coverage fixes

Scope: extend `logAudit` to remaining important actions listed in §6. No schema changes — `ih_audit_log` + `ih_log_audit` RPC already exist. System Issues filters already in place (type/status/time window), so the earlier "verify filters" finding is closed — no UI change needed.

### Edits

**`src/lib/internal-hub/repos/staffRepo.ts`**
- Import `logAudit`.
- Log on `create` → action `staff.created` (summary: name + email + role).
- Log on `update` → action `staff.updated`; if `patch.role` differs from prior, also emit `staff.role_changed` with `{from, to}` metadata.
- Log on `deactivate` → action `staff.deactivated`.
- Log on `reactivate` → action `staff.reactivated`.
- Log on `hardDelete` → action `staff.hard_deleted` (rare exception path).

**`src/lib/internal-hub/repos/noticeRepo.ts`**
- Log on `acknowledge` → action `notice.acknowledged`, target `ih_notices/{noticeId}`, metadata `{staffId}`.

**`src/lib/internal-hub/repos/payslipRepo.ts`**
- Import `logAudit`.
- Log on `generateForRun` after insert succeeds → action `payslip.generated`, summary `Generated N payslips for {month}`, metadata `{runId, count}`.
- Log on `regeneratePdf` → action `payslip.pdf_regenerated`, target `ih_payslips/{id}`.

All `logAudit` calls use `void logAudit({...})` so audit failures never break the primary workflow (existing pattern).

### Out of scope (per existing memory)
- AI extraction §16–§24 stays deferred.
- File upload/delete and integration-failure audit entries are already captured via `ih_email_log`, `ih_calendar_sync_log`, and `ih_payslips.pdf_error` and surfaced in System Issues — no duplicate audit row needed.
- `toolAccessRepo` is localStorage-only; no DB action to audit.

### Expected outcome
Doc 4.3 compliance moves from 79% → ~95%. Remaining gaps are intentionally deferred (AI extraction).
