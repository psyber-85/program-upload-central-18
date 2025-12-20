// ============================================
// AIHQ Placement Portal - Data Client
// ============================================
// Single entry point for all data operations.
// To swap mock with Supabase, modify the repository imports.

export {
  employerRepo,
  roleRequestRepo,
  candidateRepo,
  matchRepo,
  loiRepo,
  trainingRepo,
  activityRepo,
  taskRepo,
  noteRepo,
} from './repositories';

// Re-export types for convenience
export * from './types';
