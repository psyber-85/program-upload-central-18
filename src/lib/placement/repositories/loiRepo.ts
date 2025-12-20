// ============================================
// LOI Repository
// Replace mock implementation with Supabase later
// ============================================

import { LOIRecord, LOIStatus } from '../types';
import { mockLOIRecords } from '../mockData';

let loiRecords = [...mockLOIRecords];

export const loiRepo = {
  getAll: async (): Promise<LOIRecord[]> => {
    return loiRecords;
  },

  getById: async (id: string): Promise<LOIRecord | null> => {
    return loiRecords.find((l) => l.id === id) || null;
  },

  getByCompany: async (companyId: string): Promise<LOIRecord[]> => {
    return loiRecords.filter((l) => l.company_id === companyId);
  },

  getByStatus: async (status: LOIStatus): Promise<LOIRecord[]> => {
    return loiRecords.filter((l) => l.status === status);
  },

  getPending: async (): Promise<LOIRecord[]> => {
    return loiRecords.filter((l) => 
      l.status === 'PENDING_REVIEW' || l.status === 'PENDING_SIGNATURE'
    );
  },

  create: async (data: Omit<LOIRecord, 'id' | 'created_at' | 'updated_at'>): Promise<LOIRecord> => {
    const newLOI: LOIRecord = {
      ...data,
      id: `loi-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    loiRecords.push(newLOI);
    return newLOI;
  },

  updateStatus: async (id: string, status: LOIStatus): Promise<LOIRecord | null> => {
    const index = loiRecords.findIndex((l) => l.id === id);
    if (index === -1) return null;
    loiRecords[index] = {
      ...loiRecords[index],
      status,
      updated_at: new Date().toISOString(),
      ...(status === 'SIGNED' ? { signed_at: new Date().toISOString() } : {}),
    };
    return loiRecords[index];
  },

  reset: () => {
    loiRecords = [...mockLOIRecords];
  },
};
