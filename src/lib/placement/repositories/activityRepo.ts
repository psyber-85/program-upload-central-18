// ============================================
// Activity Repository
// Replace mock implementation with Supabase later
// ============================================

import { ActivityLog, ActivityEntityType } from '../types';
import { mockActivityLogs } from '../mockData';

let activities = [...mockActivityLogs];

export const activityRepo = {
  getAll: async (): Promise<ActivityLog[]> => {
    return activities.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  },

  getByEntity: async (entityType: ActivityEntityType, entityId: string): Promise<ActivityLog[]> => {
    return activities
      .filter((a) => a.entity_type === entityType && a.entity_id === entityId)
      .sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
  },

  getRecent: async (limit: number = 10): Promise<ActivityLog[]> => {
    return activities
      .sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
      .slice(0, limit);
  },

  create: async (data: Omit<ActivityLog, 'id' | 'timestamp'>): Promise<ActivityLog> => {
    const newActivity: ActivityLog = {
      ...data,
      id: `act-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    activities.push(newActivity);
    return newActivity;
  },

  reset: () => {
    activities = [...mockActivityLogs];
  },
};
