// Shared access helpers (Doc 0.1 §25). Permission logic stays here, not in pages.
import type { StaffProfile } from './types';

export const isAdmin = (s?: StaffProfile | null) => s?.role === 'Admin';
export const isStaff = (s?: StaffProfile | null) => s?.role === 'Staff';
export const isActiveStaff = (s?: StaffProfile | null) => s?.status === 'Active';

export function canAccessAdminArea(s?: StaffProfile | null) {
  return isAdmin(s) && isActiveStaff(s);
}

export function canViewStaffProfile(viewer?: StaffProfile | null, target?: StaffProfile | null) {
  if (!viewer || !target) return false;
  if (isAdmin(viewer)) return true;
  return viewer.id === target.id; // staff sees only self
}

export function canEditStaffProfile(viewer?: StaffProfile | null) {
  // Doc 0.1 §16 — staff cannot edit own profile in Day 1
  return isAdmin(viewer);
}
