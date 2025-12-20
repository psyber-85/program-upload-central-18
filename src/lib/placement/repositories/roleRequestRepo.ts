// ============================================
// Role Request Repository
// Replace mock implementation with Supabase later
// ============================================

import { RoleRequest, RoleRequestStatus } from '../types';
import { mockRoleRequests } from '../mockData';

let roleRequests = [...mockRoleRequests];

export const roleRequestRepo = {
  getAll: async (): Promise<RoleRequest[]> => {
    return roleRequests;
  },

  getByCompany: async (companyId: string): Promise<RoleRequest[]> => {
    return roleRequests.filter((r) => r.company_id === companyId);
  },

  getById: async (id: string): Promise<RoleRequest | null> => {
    return roleRequests.find((r) => r.id === id) || null;
  },

  getByStatus: async (status: RoleRequestStatus): Promise<RoleRequest[]> => {
    return roleRequests.filter((r) => r.status === status);
  },

  create: async (data: Omit<RoleRequest, 'id' | 'created_at' | 'updated_at'>): Promise<RoleRequest> => {
    const newRole: RoleRequest = {
      ...data,
      id: `role-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    roleRequests.push(newRole);
    return newRole;
  },

  updateStatus: async (id: string, status: RoleRequestStatus): Promise<RoleRequest | null> => {
    const index = roleRequests.findIndex((r) => r.id === id);
    if (index === -1) return null;
    roleRequests[index] = {
      ...roleRequests[index],
      status,
      updated_at: new Date().toISOString(),
    };
    return roleRequests[index];
  },

  reset: () => {
    roleRequests = [...mockRoleRequests];
  },
};
