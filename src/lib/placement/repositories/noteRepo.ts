// ============================================
// Internal Note Repository
// Replace mock implementation with Supabase later
// ============================================

import { InternalNote, ActivityEntityType } from '../types';
import { mockInternalNotes } from '../mockData';

let notes = [...mockInternalNotes];

export const noteRepo = {
  getAll: async (): Promise<InternalNote[]> => {
    return notes;
  },

  getByEntity: async (entityType: ActivityEntityType, entityId: string): Promise<InternalNote[]> => {
    return notes
      .filter((n) => n.entity_type === entityType && n.entity_id === entityId)
      .sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
  },

  // Get only notes visible to employers (internal_only = false)
  getPublicByEntity: async (entityType: ActivityEntityType, entityId: string): Promise<InternalNote[]> => {
    return notes
      .filter((n) => 
        n.entity_type === entityType && 
        n.entity_id === entityId && 
        !n.internal_only
      )
      .sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
  },

  create: async (data: Omit<InternalNote, 'id' | 'created_at'>): Promise<InternalNote> => {
    const newNote: InternalNote = {
      ...data,
      id: `note-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    notes.push(newNote);
    return newNote;
  },

  reset: () => {
    notes = [...mockInternalNotes];
  },
};
