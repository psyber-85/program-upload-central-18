import { z } from 'zod';

export const hiringInterestSchema = z.object({
  companyName: z
    .string()
    .trim()
    .min(1, 'Company name is required')
    .max(100, 'Company name must be less than 100 characters'),
  contactPerson: z
    .string()
    .trim()
    .min(1, 'Contact person is required')
    .max(100, 'Name must be less than 100 characters'),
  email: z
    .string()
    .trim()
    .email('Please enter a valid email address')
    .max(255, 'Email must be less than 255 characters'),
  roles: z
    .string()
    .trim()
    .min(1, 'Please specify the role(s) you are hiring for')
    .max(500, 'Roles description must be less than 500 characters'),
  headcount: z.enum(['1-5', '5-10', '10-30', '30+'], {
    required_error: 'Please select a headcount range',
  }),
  timeline: z.enum(['immediate', '1-3-months', 'exploring'], {
    required_error: 'Please select a hiring timeline',
  }),
  genuineNeed: z.literal(true, {
    errorMap: () => ({ message: 'Please confirm you have a genuine hiring need' }),
  }),
  notes: z
    .string()
    .max(1000, 'Notes must be less than 1000 characters')
    .optional(),
});

export type HiringInterestFormData = z.infer<typeof hiringInterestSchema>;
