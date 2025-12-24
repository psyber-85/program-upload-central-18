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

// LocalStorage Implementations (default)
export {
  authLocalRepo,
  staffLocalRepo,
  requestsLocalRepo,
  payrollLocalRepo,
  entriesLocalRepo,
  docsLocalRepo,
  statsLocalRepo,
} from './localStorage';

// Utils
export * from './utils';

// ============================================
// HOW TO SWAP TO SUPABASE LATER
// ============================================
// 
// 1. Create Supabase implementations in /localStorage/supabase/ folder
//    e.g., AuthSupabaseRepo.ts, StaffSupabaseRepo.ts, etc.
// 
// 2. Each implementation should implement the same interface
//    e.g., AuthSupabaseRepo implements AuthRepo
// 
// 3. Update this file to export Supabase implementations instead:
//    export { authSupabaseRepo as authRepo } from './supabase/AuthSupabaseRepo';
// 
// 4. All consuming code will automatically use Supabase
//    because they import from this index file
// ============================================
