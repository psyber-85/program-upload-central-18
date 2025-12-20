// ============================================
// Candidate Repository
// Replace mock implementation with Supabase later
// ============================================

import { CandidateProfile, CandidateStatus, AISkillLevel } from '../types';
import { mockCandidates } from '../mockData';

let candidates = [...mockCandidates];

export const candidateRepo = {
  getAll: async (): Promise<CandidateProfile[]> => {
    return candidates;
  },

  getById: async (id: string): Promise<CandidateProfile | null> => {
    return candidates.find((c) => c.id === id) || null;
  },

  getByStatus: async (status: CandidateStatus): Promise<CandidateProfile[]> => {
    return candidates.filter((c) => c.status === status);
  },

  getPlacementReady: async (): Promise<CandidateProfile[]> => {
    return candidates.filter((c) => c.placement_readiness);
  },

  getBySkillLevel: async (level: AISkillLevel): Promise<CandidateProfile[]> => {
    return candidates.filter((c) => c.ai_skill_level === level);
  },

  // Get candidates that have been matched to a specific role (for employer view)
  getCuratedForRole: async (roleId: string, matchedCandidateIds: string[]): Promise<CandidateProfile[]> => {
    return candidates.filter((c) => matchedCandidateIds.includes(c.id));
  },

  updateStatus: async (id: string, status: CandidateStatus): Promise<CandidateProfile | null> => {
    const index = candidates.findIndex((c) => c.id === id);
    if (index === -1) return null;
    candidates[index] = {
      ...candidates[index],
      status,
      updated_at: new Date().toISOString(),
    };
    return candidates[index];
  },

  reset: () => {
    candidates = [...mockCandidates];
  },
};
