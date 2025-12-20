// ============================================
// Employer Repository
// Replace mock implementation with Supabase later
// ============================================

import { EmployerCompany, EmployerUser } from '../types';
import { mockCompanies, mockEmployerUsers } from '../mockData';

// In-memory store for mutations
let companies = [...mockCompanies];
let users = [...mockEmployerUsers];

export const employerRepo = {
  // Companies
  getCompanies: async (): Promise<EmployerCompany[]> => {
    return companies;
  },

  getCompanyById: async (id: string): Promise<EmployerCompany | null> => {
    return companies.find((c) => c.id === id) || null;
  },

  // Users
  getUsersByCompany: async (companyId: string): Promise<EmployerUser[]> => {
    return users.filter((u) => u.company_id === companyId);
  },

  getUserById: async (id: string): Promise<EmployerUser | null> => {
    return users.find((u) => u.id === id) || null;
  },

  // For demo purposes - reset to initial state
  reset: () => {
    companies = [...mockCompanies];
    users = [...mockEmployerUsers];
  },
};
