## Problem

In Marketing → Register Tracker, when the prospect (participant) and the HR contact share the same email (e.g. Ahmed Tashrik, who acts as his own HR), `send-hr-notification` returns a non-2xx error and the email fails to send.

Likely cause (matches SendGrid behavior): the edge function builds a `personalizations` block with `to: [HR, participant]` and a fixed `cc: [zarnaaz@theaihq.net]`. SendGrid rejects a personalization when the same address appears in more than one slot, or when required `name`/`email` fields are blank. The current dedupe only trims `to` against `to` — it does NOT handle:

1. participant email equal to HR email but written with different casing/whitespace (mostly handled, but the resulting single-recipient payload still relies on `to_name` being non-empty).
2. participant or HR email equal to the CC (`zarnaaz@theaihq.net`) — would produce a duplicate across to+cc.
3. The case where the only `to` left after dedupe has an empty `name`, which SendGrid 400s on.
4. The frontend never tells the user this is a "self-HR" send, so the UX is silent on what happened.

## Plan (scoped strictly to this issue — no other changes)

### 1. Backend: `supabase/functions/send-hr-notification/index.ts`

- Normalise all addresses (lowercase + trim) once into `hrEmailNorm`, `participantEmailNorm`, `ccEmailNorm = 'zarnaaz@theaihq.net'`.
- Build `to` list:
  - Always include HR (`to_email`, name = `to_name || to_email`).
  - Add participant only if `participantEmailNorm !== hrEmailNorm` AND `participantEmailNorm !== ccEmailNorm`.
- Build `cc` list:
  - Include `zarnaaz@theaihq.net` only if it is not already in the final `to` list.
  - If after that `cc` is empty, omit the `cc` field entirely from the personalization (SendGrid requires either non-empty or absent).
- Guarantee every recipient object has a non-empty `name` (fall back to the email local-part).
- When `participantEmailNorm === hrEmailNorm`, append a one-line note at the top of both the plain-text and HTML bodies: *"Note: This message is sent to you as both the HR contact and the program participant."*
- Improve error surface: on SendGrid 4xx, return `{ success: false, error, sendgridStatus, sendgridBody }` with HTTP 200 so the frontend can display a meaningful toast instead of an opaque "non-2xx" error.

### 2. Frontend: `src/components/NotifyHRModal.tsx`

- Compute `isSelfHR = hrEmail && prospectData?.email && hrEmail.trim().toLowerCase() === prospectData.email.trim().toLowerCase()`.
- When `isSelfHR` is true:
  - Show an info banner at the top of the dialog: *"Participant is also the HR contact — a single email will be sent to this address (CC: AIHQ)."*
  - Keep the Send button enabled (no behavior change otherwise).
- Read the new structured error from the edge function and surface `error` / `sendgridBody` in the failure toast so future failures are diagnosable.

### 3. Out of scope

- No change to HR contact data model, prospect schema, program links, pricing, sender identity, CC address, or any other portal area.
- No retroactive re-send for previously failed records — user can retry from the existing UI after this fix.

## Files touched

- `supabase/functions/send-hr-notification/index.ts` (dedupe + cc handling + better error response + self-HR note)
- `src/components/NotifyHRModal.tsx` (self-HR banner + richer error toast)

## Validation

- Trigger Notify HR for Ahmed Tashrik (participant == HR) → expect a single recipient send, CC to AIHQ preserved, 200 response, success toast.
- Trigger normal case (participant != HR) → unchanged behavior, both recipients receive the email.
- Trigger edge case where HR email == `zarnaaz@theaihq.net` → CC omitted, no duplicate-address rejection.
