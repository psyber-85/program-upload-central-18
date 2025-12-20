// ============================================
// Task Repository
// Replace mock implementation with Supabase later
// ============================================

import { Task, TaskStatus } from '../types';
import { mockTasks } from '../mockData';

let tasks = [...mockTasks];

export const taskRepo = {
  getAll: async (): Promise<Task[]> => {
    return tasks.sort((a, b) => 
      new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
    );
  },

  getById: async (id: string): Promise<Task | null> => {
    return tasks.find((t) => t.id === id) || null;
  },

  getByStatus: async (status: TaskStatus): Promise<Task[]> => {
    return tasks.filter((t) => t.status === status);
  },

  getPending: async (): Promise<Task[]> => {
    return tasks.filter((t) => t.status === 'pending' || t.status === 'in_progress');
  },

  getOverdue: async (): Promise<Task[]> => {
    const now = new Date();
    return tasks.filter((t) => 
      (t.status === 'pending' || t.status === 'in_progress') && 
      new Date(t.due_date) < now
    );
  },

  create: async (data: Omit<Task, 'id' | 'created_at'>): Promise<Task> => {
    const newTask: Task = {
      ...data,
      id: `task-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    tasks.push(newTask);
    return newTask;
  },

  updateStatus: async (id: string, status: TaskStatus): Promise<Task | null> => {
    const index = tasks.findIndex((t) => t.id === id);
    if (index === -1) return null;
    tasks[index] = {
      ...tasks[index],
      status,
    };
    return tasks[index];
  },

  reset: () => {
    tasks = [...mockTasks];
  },
};
