// ============================================
// Training Repository
// Replace mock implementation with Supabase later
// ============================================

import { 
  TrainingProgram, 
  TrainingEnrollment, 
  TrainingEnrollmentStatus 
} from '../types';
import { mockTrainingPrograms, mockTrainingEnrollments } from '../mockData';

let programs = [...mockTrainingPrograms];
let enrollments = [...mockTrainingEnrollments];

export const trainingRepo = {
  // Programs
  getPrograms: async (): Promise<TrainingProgram[]> => {
    return programs;
  },

  getProgramById: async (id: string): Promise<TrainingProgram | null> => {
    return programs.find((p) => p.id === id) || null;
  },

  // Enrollments
  getEnrollments: async (): Promise<TrainingEnrollment[]> => {
    return enrollments;
  },

  getEnrollmentsByCandidate: async (candidateId: string): Promise<TrainingEnrollment[]> => {
    return enrollments.filter((e) => e.candidate_id === candidateId);
  },

  getEnrollmentsByStatus: async (status: TrainingEnrollmentStatus): Promise<TrainingEnrollment[]> => {
    return enrollments.filter((e) => e.status === status);
  },

  getActiveEnrollments: async (): Promise<TrainingEnrollment[]> => {
    return enrollments.filter((e) => e.status === 'IN_PROGRESS' || e.status === 'ENROLLED');
  },

  createEnrollment: async (
    data: Omit<TrainingEnrollment, 'id' | 'created_at' | 'updated_at'>
  ): Promise<TrainingEnrollment> => {
    const newEnrollment: TrainingEnrollment = {
      ...data,
      id: `enroll-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    enrollments.push(newEnrollment);
    return newEnrollment;
  },

  updateProgress: async (id: string, progress: number): Promise<TrainingEnrollment | null> => {
    const index = enrollments.findIndex((e) => e.id === id);
    if (index === -1) return null;
    enrollments[index] = {
      ...enrollments[index],
      progress_percent: progress,
      status: progress >= 100 ? 'COMPLETED' : enrollments[index].status,
      updated_at: new Date().toISOString(),
    };
    return enrollments[index];
  },

  reset: () => {
    programs = [...mockTrainingPrograms];
    enrollments = [...mockTrainingEnrollments];
  },
};
