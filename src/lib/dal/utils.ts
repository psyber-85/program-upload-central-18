// Utility functions for DAL

// Generate unique ID
export const generateId = (): string => {
  return crypto.randomUUID();
};

// Simulated async delay (to mimic network latency)
export const delay = (ms: number = 100): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Get current ISO timestamp
export const now = (): string => {
  return new Date().toISOString();
};

// Get current month in YYYY-MM format
export const getCurrentMonth = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

// Get month from ISO date
export const getMonthFromDate = (isoDate: string): string => {
  return isoDate.slice(0, 7); // 'YYYY-MM'
};

// Add months to a date
export const addMonths = (isoDate: string, months: number): string => {
  const d = new Date(isoDate);
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 10);
};

// Add years to a date
export const addYears = (isoDate: string, years: number): string => {
  const d = new Date(isoDate);
  d.setFullYear(d.getFullYear() + years);
  return d.toISOString().slice(0, 10);
};

// Check if date is in the past
export const isPast = (isoDate: string): boolean => {
  return new Date(isoDate) < new Date();
};

// Check if date is in current month
export const isCurrentMonth = (isoDate: string): boolean => {
  return getMonthFromDate(isoDate) === getCurrentMonth();
};

// Format currency (RM)
export const formatCurrency = (amount: number): string => {
  return `RM ${amount.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// LocalStorage helpers
const STORAGE_PREFIX = 'aihq_portal_';

export const storageGet = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(STORAGE_PREFIX + key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
};

export const storageSet = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
};

export const storageRemove = (key: string): void => {
  try {
    localStorage.removeItem(STORAGE_PREFIX + key);
  } catch (e) {
    console.error('Failed to remove from localStorage:', e);
  }
};

// Check if seeded
export const isSeeded = (): boolean => {
  return storageGet('seeded', false);
};

export const markSeeded = (): void => {
  storageSet('seeded', true);
};
