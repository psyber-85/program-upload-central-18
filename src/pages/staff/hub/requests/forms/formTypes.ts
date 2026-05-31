// Patch 1.4 — Shared types for per-type request forms.
import type { HalfDaySlot, RequestPayload } from '@/lib/internal-hub/repos/requestRepo';

export interface RequestFormValue {
  payload: RequestPayload;
  halfDaySlot?: HalfDaySlot;
  file?: File | null;
}

export interface RequestFormProps {
  initial?: RequestPayload;
  initialHalfDay?: HalfDaySlot;
  onSubmit: (value: RequestFormValue) => Promise<void> | void;
  submitLabel?: string;
  submitting?: boolean;
}

export const CLAIM_CATEGORIES = ['Transport', 'Parking / Toll', 'Meals', 'Office / Tools', 'Training', 'Other'];
export const BENEFIT_TOPICS = [
  'Insurance coverage question',
  'Benefit eligibility question',
  'Benefit admin issue',
  'Benefit document / request clarification',
  'Other benefit question',
];
export const OTHER_CATEGORIES = [
  'Equipment request',
  'Admin help',
  'Document request',
  'Access clarification',
  'Other internal admin matter',
];
