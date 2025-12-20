# AIHQ Talent Placement Portal

A modern talent placement platform connecting employers with AI-augmented workplace talent.

## Product Positioning

**This platform is for AI-augmented business roles only** - people who use AI tools to improve business workflows, productivity, automation, and decision support (non-engineering).

### Target Role Categories

- Operations Executive (AI-enabled)
- Admin / PMO / Project Coordinator (AI-enabled)
- Marketing Ops / Content Ops (AI-enabled)
- Sales Ops / CRM Ops (AI-enabled)
- Customer Support Ops (AI-enabled)
- Business Analyst (AI-enabled)
- Process Automation Specialist (no-code/low-code + AI tools)
- Knowledge Management / Documentation Specialist (AI-enabled)
- Internal Productivity / Automation Coordinator
- AI Workplace Power User (non-technical)

### NOT Supported

This platform does NOT support deep AI engineering roles including:
- AI Engineer / ML Engineer / NLP Engineer
- Data Scientist (hardcore) / Research Scientist
- MLOps / Model training / Fine-tuning roles
- Any role requiring Python ML pipelines, model training, or research-level ML skills

---

## Commitment & Risk Doctrine

### LOI ≠ Employment

- **Hiring is optional.** Employers retain the right to decide not to proceed if a candidate is unsuitable.
- **The LOI is not an employment contract** and does not obligate the employer to hire.
- The LOI enables AIHQ to proceed with training coordination and grant workflow (subject to approval). **Final hiring decision is made later.**

### Decision Checkpoints

The platform implements 3 explicit decision checkpoints:

1. **After Interview**
   - Employer can select: "Proceed" or "Not proceeding (fit)"
   - If not proceeding, system records a respectful close reason and suggests alternatives

2. **Before LOI Signing**
   - LOI screen includes clear callout: "LOI ≠ employment. Hiring optional."
   - Employer can: "Request LOI", "Hold", or "Not proceeding"

3. **After Training Completion**
   - Employer can: "Confirm Hire / Placement" or "Do not hire (fit)"
   - If not hiring, case moves to non-punitive exit status

### Safe Exit Statuses

The platform supports respectful exit flows:
- `NOT_PROCEEDING_FIT` - Employer decided not to proceed based on fit
- `WITHDRAWN_BY_EMPLOYER` - Employer withdrew from process
- `TRAINING_COMPLETED_NOT_HIRED` - Completed training but not hired
- `CLOSED_NO_HIRE` - Case closed without hire
- `CLOSED_REPLACED_BY_ALTERNATIVE` - Replaced with alternative candidate

**Safe exits are normal and supported.** They do not appear as failures.

---

## AI Skill Framework (Workplace-Focused)

### L1 — AI Awareness (Workplace)
Understands AI basics, uses ChatGPT safely for drafting/summarising, can follow best practices and company policies.

### L2 — AI Workplace User
Uses AI daily to improve output quality/speed; can create repeatable prompting workflows; understands data sensitivity; can apply AI to routine tasks.

### L3 — AI Workflow Automation Specialist (Non-engineering)
Builds AI-supported workflows using no-code/low-code tools; integrates with common apps (e.g., docs, sheets, CRM) via automation platforms; can create SOPs and measurable productivity gains.

### L4 — AI Adoption Lead (Business)
Leads AI adoption in teams; defines use cases, trains others, sets governance; coordinates AI solutions needs with vendors/consultants (does not build models).

---

## Project Info

**URL**: https://lovable.dev/projects/678221d2-d07f-4bab-a18c-940cf97afeb1

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/678221d2-d07f-4bab-a18c-940cf97afeb1) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/678221d2-d07f-4bab-a18c-940cf97afeb1) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
