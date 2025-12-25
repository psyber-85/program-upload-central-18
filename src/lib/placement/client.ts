// Placement System - Repository Client
// Export current implementations (easy to swap to Supabase later)
// All repos exported individually for use across the app

export { initializeMockData, resetMockData } from './mockDb';

export {
  companyLocalRepo as companyRepo,
  employerUserLocalRepo as employerUserRepo,
  placementUserLocalRepo as placementUserRepo,
  roleLocalRepo as roleRepo,
  candidateLocalRepo as candidateRepo,
  submissionLocalRepo as submissionRepo,
  loiLocalRepo as loiRepo,
  selectionLocalRepo as selectionRepo,
  programmeLocalRepo as programmeRepo,
  activityLocalRepo as activityRepo,
  taskLocalRepo as taskRepo,
  talentRequestLocalRepo as talentRequestRepo,
} from './localStorage';
