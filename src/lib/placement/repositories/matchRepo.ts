// ============================================
// Match Repository
// Replace mock implementation with Supabase later
// ============================================

import { MatchRecord, MatchStatus } from '../types';
import { mockMatches } from '../mockData';

let matches = [...mockMatches];

export const matchRepo = {
  getAll: async (): Promise<MatchRecord[]> => {
    return matches;
  },

  getByRoleRequest: async (roleRequestId: string): Promise<MatchRecord[]> => {
    return matches.filter((m) => m.role_request_id === roleRequestId);
  },

  getByCandidate: async (candidateId: string): Promise<MatchRecord[]> => {
    return matches.filter((m) => m.candidate_id === candidateId);
  },

  getById: async (id: string): Promise<MatchRecord | null> => {
    return matches.find((m) => m.id === id) || null;
  },

  getByStatus: async (status: MatchStatus): Promise<MatchRecord[]> => {
    return matches.filter((m) => m.match_status === status);
  },

  create: async (data: Omit<MatchRecord, 'id' | 'created_at' | 'updated_at'>): Promise<MatchRecord> => {
    const newMatch: MatchRecord = {
      ...data,
      id: `match-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    matches.push(newMatch);
    return newMatch;
  },

  updateStatus: async (id: string, status: MatchStatus): Promise<MatchRecord | null> => {
    const index = matches.findIndex((m) => m.id === id);
    if (index === -1) return null;
    matches[index] = {
      ...matches[index],
      match_status: status,
      updated_at: new Date().toISOString(),
    };
    return matches[index];
  },

  updateEmployerInterest: async (
    id: string,
    interest: 'yes' | 'no' | 'pending'
  ): Promise<MatchRecord | null> => {
    const index = matches.findIndex((m) => m.id === id);
    if (index === -1) return null;
    matches[index] = {
      ...matches[index],
      employer_interest: interest,
      updated_at: new Date().toISOString(),
    };
    return matches[index];
  },

  reset: () => {
    matches = [...mockMatches];
  },
};
