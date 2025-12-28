// Data Access Layer - Main Export

// Types
export * from './types';

// Interfaces
export type { AuthRepo } from './interfaces/AuthRepo';
export type { StaffRepo } from './interfaces/StaffRepo';
export type { RequestsRepo } from './interfaces/RequestsRepo';
export type { PayrollRepo } from './interfaces/PayrollRepo';
export type { EntriesRepo } from './interfaces/EntriesRepo';
export type { DocsRepo } from './interfaces/DocsRepo';
export type { StatsRepo } from './interfaces/StatsRepo';

// Supabase Implementations (production)
export {
  authSupabaseRepo,
  staffSupabaseRepo,
  requestsSupabaseRepo,
  payrollSupabaseRepo,
  entriesSupabaseRepo,
  docsSupabaseRepo,
  statsSupabaseRepo,
} from './supabase';

// Utils
export * from './utils';
