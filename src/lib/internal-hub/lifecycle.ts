// Lifecycle builders per Doc 0.2 §9, §12, §15, §22.
import type {
  ChecklistItem,
  OffboardingChecklist,
  OnboardingChecklist,
  StaffProfile,
  ToolAccessItem,
  ToolKey,
} from './types';
import { TOOL_LABELS } from './types';
import { nowISO } from './storage';

export function notionUnlockDate(joinDate: string): Date {
  const d = new Date(joinDate);
  d.setMonth(d.getMonth() + 1);
  return d;
}

export function isNotionUnlocked(joinDate: string, now = new Date()): boolean {
  return now >= notionUnlockDate(joinDate);
}

// Doc 0.2 §9
const DEFAULT_ONBOARDING: Array<Pick<ChecklistItem, 'key' | 'label' | 'owner' | 'link'>> = [
  { key: 'portal_account', label: 'Portal account created', owner: 'admin' },
  { key: 'salary_settings', label: 'Salary settings added', owner: 'admin' },
  { key: 'leave_balance_init', label: 'Leave balance initialized', owner: 'admin' },
  { key: 'training_fund_timer', label: 'Training fund timer started', owner: 'admin' },
  { key: 'youtube_training', label: 'YouTube Training available', owner: 'staff', link: 'https://youtube.com/@aihq' },
  { key: 'notion_unlock_set', label: 'Notion unlock date set', owner: 'admin' },
  { key: 'tools_checklist', label: 'Company tools checklist created', owner: 'admin' },
  { key: 'insurance_status', label: 'Insurance status recorded', owner: 'admin' },
  { key: 'welcome_email', label: 'Welcome email sent or queued', owner: 'admin' },
  { key: 'aihq_ways', label: 'AIHQ Ways of Working assigned', owner: 'staff', link: 'https://www.notion.so/aihq-ways' },
  { key: 'onboarding_videos', label: 'Onboarding videos assigned', owner: 'staff' },
  { key: 'onboarding_quiz', label: 'Onboarding quiz assigned', owner: 'staff' },
  { key: 'sop_policy_links', label: 'Relevant SOP/policy links assigned', owner: 'staff' },
];

export function buildDefaultOnboarding(staffId: string): OnboardingChecklist {
  return {
    staffId,
    items: DEFAULT_ONBOARDING.map((i) => ({ ...i, status: 'pending' })),
  };
}

const DEFAULT_TOOLS: ToolKey[] = [
  'GoogleEmail',
  'GoogleDrive',
  'Notion',
  'ChatGPT',
  'Gemini',
  'YouTubeTraining',
  'AIHQSocial',
  'Other',
];

export function buildDefaultToolChecklist(staffId: string): ToolAccessItem[] {
  return DEFAULT_TOOLS.map((tool) => ({
    staffId,
    tool,
    label: TOOL_LABELS[tool],
    status: 'Pending',
  }));
}

// Doc 0.2 §22
const DEFAULT_OFFBOARDING: Array<Pick<ChecklistItem, 'key' | 'label' | 'owner'>> = [
  { key: 'disable_login', label: 'Disable portal login', owner: 'admin' },
  { key: 'remove_notion', label: 'Remove Notion access', owner: 'admin' },
  { key: 'remove_google_email', label: 'Remove Google / company email access', owner: 'admin' },
  { key: 'remove_google_drive', label: 'Remove Google Drive access', owner: 'admin' },
  { key: 'remove_chatgpt', label: 'Remove ChatGPT / OpenAI shared access', owner: 'admin' },
  { key: 'remove_gemini', label: 'Remove Gemini access', owner: 'admin' },
  { key: 'remove_social', label: 'Remove AIHQ social media page access', owner: 'admin' },
  { key: 'review_youtube', label: 'Review YouTube Training / resource access', owner: 'admin' },
  { key: 'final_claims_check', label: 'Final claims check', owner: 'admin' },
  { key: 'final_payroll_check', label: 'Final payroll check', owner: 'admin' },
  { key: 'final_payslip_check', label: 'Final payslip / history check', owner: 'admin' },
  { key: 'mark_complete', label: 'Mark offboarding complete', owner: 'admin' },
];

export function buildDefaultOffboarding(staffId: string): OffboardingChecklist {
  return {
    staffId,
    startedAt: nowISO(),
    items: DEFAULT_OFFBOARDING.map((i) => ({ ...i, status: 'pending' })),
  };
}

export function deriveOnboardingState(c?: OnboardingChecklist) {
  if (!c || c.items.length === 0) return 'NotStarted' as const;
  const done = c.items.filter(
    (i) => i.status === 'complete' || i.status === 'admin-verified',
  ).length;
  if (done === 0) return 'NotStarted' as const;
  if (done === c.items.length) return 'Complete' as const;
  return 'InProgress' as const;
}

export function checklistProgress(items: ChecklistItem[]) {
  const done = items.filter(
    (i) => i.status === 'complete' || i.status === 'admin-verified',
  ).length;
  return { done, total: items.length };
}

// Day 1: any non-empty lifecycle artefact counts as activity for the hard-delete guard.
export function hasActivity(staff: StaffProfile, opts: {
  onboarding?: OnboardingChecklist;
  tools?: ToolAccessItem[];
  offboarding?: OffboardingChecklist;
}) {
  const onboardingTouched = !!opts.onboarding?.items.some((i) => i.status !== 'pending');
  const toolsTouched = !!opts.tools?.some((t) => t.status !== 'Pending');
  const offboardingExists = !!opts.offboarding;
  return onboardingTouched || toolsTouched || offboardingExists || staff.status === 'Inactive';
}
