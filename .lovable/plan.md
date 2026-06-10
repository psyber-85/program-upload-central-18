# Patch 1.7 — Employer EPF, live Workbench, marketing email & JSON bulk-fill

## 1. Employer EPF / SOCSO / EIS always 0

**Root cause.** `buildItem()` in `payrollRepo.ts` correctly computes employer EPF/SOCSO/EIS (defaults 13 / 1.75 / 0.2 when staff rates null). Newest run shows correct values (employer_epf=390 on base=3000). But the older draft and all `ih_payslips` rows have employer_*=0 because they were created/finalized before this calc landed. PayslipDetail then renders "Employer EPF 0.00".

**Fix**
- **Data backfill** via `supabase--insert`: update `ih_payroll_items` and `ih_payslips` where `employer_epf = 0 AND base_salary > 0`, recomputing:
  - `employer_epf = base_salary * coalesce(s.employer_epf_rate, 13)/100`
  - `employer_socso = base_salary * coalesce(s.employer_socso_rate, 1.75)/100`
  - `employer_eis = base_salary * coalesce(s.employer_eis_rate, 0.2)/100`
  - `total_employer_contribution = sum`
  - Net pay untouched (Patch 1.5 invariant).
- **Defense-in-depth** in `payrollRepo.mapItem`: if `employer_epf===0 && base_salary>0`, recompute on read using cached staff rates. Display only, no DB write.

## 2. Admin Workbench — not "live and real"

**Audit:**

| Source | Backed by | Live? |
| --- | --- | --- |
| `requestSummaryRepo.listPendingApprovalsDetailed()` | Supabase | yes |
| `staffRepo.list()` | Supabase | yes |
| `systemIssuesRepo.listSystemIssues()` | Supabase | yes |
| `payrollRepo.statusFor(month)` | Supabase | yes |
| **`onboardingRepo.get()`** | **localStorage** | **NO — per-device** |
| **`offboardingRepo.get()`** | **localStorage** | **NO — per-device** |
| **`toolAccessRepo.get()` (Notion access)** | in-memory cache | partial |

**Fix (surgical — no new tables):**
- In `AdminWorkbench.tsx`: `useEffect(() => { toolAccessRepo.ensureLoadedAll().then(() => qc.invalidateQueries(['ih-staff-list'])); }, [staff.length])` so Notion-access items reflect DB truth.
- In `adminWorkbench.ts buildWorkbenchItems`: only emit Onboarding/Offboarding items when local checklist has *actual progress* (>0 items touched). Stops fake "incomplete" rows on machines that never opened that staff.
- Add `refetchInterval: 30_000` to the four DB-backed queries + a "Refresh" button in the header.
- One-line info banner under the header: *"Onboarding/Offboarding checklists are tracked per-device until next patch."*

Full onboarding/offboarding → Supabase migration deferred (separate patch, new tables + RLS + repo rewrite).

## 3. Marketing — `NotifyHRModal`

### 3a. Editable HR email in the dialog
- Add `const [hrEmail, setHrEmail] = useState('')`, seed from `hrContact.email`.
- Render `<Input type="email" required>` labeled **"Send to HR Email"** above preview.
- Use `hrEmail` (not `hrContact.email`) for `supabase.functions.invoke('send-hr-notification', { to_email: hrEmail, ... })` and the recipients summary. `hr_contacts.email_sent_at` update still keys on `hrContact.id`.

### 3b. Sender swap — frontend + backend
**Email** `vino@theaihq.net` → `zarnaaz@theaihq.net`
**Name** `Vino` → `Zarnaaz`
**Phone** `016-4609464` → `011-6184-8751`

Verified-only occurrences (ripgrep):

`src/components/NotifyHRModal.tsx`
- L199 signature, L202 phone, L358 CC label, L359 From label

`supabase/functions/send-hr-notification/index.ts`
- L133 HTML signature, L136 HTML phone, L166 plain-text signature, L169 plain-text phone, L218 console log, L251 CC email, L259 From email, L293 response cc

Org name `"AIHQ Training and Consultancy"` unchanged. Then `deploy_edge_functions: ["send-hr-notification"]`.

## 4. JSON bulk-fill for "Add Prospect" modal

Currently `AddProspectModal` requires filling 7 fields one-by-one: `name, email, phone, org, role, payment, prospect_score`.

**Add a JSON mode** (toggle in the dialog header):
- Toggle button: **"Manual" | "JSON"** at top of dialog.
- JSON mode shows a single `<Textarea>` with placeholder showing the schema:
  ```json
  {
    "name": "Jane Tan",
    "email": "jane@acme.com",
    "phone": "012-3456789",
    "org": "Acme Sdn Bhd",
    "role": "HR Manager",
    "payment": "Pending",
    "prospect_score": "B"
  }
  ```
- "Apply" button parses the JSON and **only fills fields that are currently empty** ("add only, not replace existing"). Switches back to Manual view with the form populated so user can verify/edit before submit.
- Invalid JSON → inline error, no destructive change.
- Unknown keys → ignored silently (logged to console).
- `prospect_score` validated against `'A'|'B'|'C'|'D'`; falls back to existing value if invalid.
- Manual fields, validation, and submit flow unchanged.

**Scope**: `AddProspectModal.tsx` only (single file). Not applied to `AddProspectForm`, `AddHRContactModal`, or other forms in this patch — confirm if you want those too.

---

## Technical summary
- **No schema migration** — data backfill only (UPDATE ih_payroll_items + ih_payslips).
- **Code edits**: `payrollRepo.ts`, `AdminWorkbench.tsx`, `adminWorkbench.ts`, `NotifyHRModal.tsx`, `send-hr-notification/index.ts` (+ redeploy), `AddProspectModal.tsx`.
- **Memory update**: `mem://register-tracker/hr-email-notification-updates` → Zarnaaz / zarnaaz@theaihq.net / 011-6184-8751.

## Out of scope
- Migrating onboarding/offboarding repos to Supabase.
- Any other payroll UI changes.
- JSON mode on other forms (HR contact, AddProspectForm page, bulk upload).
- Any other marketing components.

## Confirm before I build
1. Workbench fix surgical (above) — or do you want full onboarding/offboarding → Supabase migration done now (bigger lift)?
2. JSON bulk-fill on `AddProspectModal` only — or also on `AddProspectForm` and `AddHRContactModal`?
