import { PayrollRun, PayrollItem, Payslip } from '../types';

export interface PayrollRepo {
  // ============================================
  // PAYROLL RUNS
  // ============================================
  
  // Get all payroll runs
  getAllPayrollRuns(): Promise<PayrollRun[]>;
  
  // Get payroll run by ID
  getPayrollRunById(id: string): Promise<PayrollRun | null>;
  
  // Get payroll run by month
  getPayrollRunByMonth(month: string): Promise<PayrollRun | null>;
  
  // Create payroll run
  createPayrollRun(month: string): Promise<PayrollRun>;
  
  // Finalize payroll run
  finalizePayrollRun(id: string): Promise<PayrollRun | null>;
  
  // Delete draft payroll run
  deletePayrollRun(id: string): Promise<boolean>;
  
  // ============================================
  // PAYROLL ITEMS
  // ============================================
  
  // Get items for a payroll run
  getPayrollItems(runId: string): Promise<PayrollItem[]>;
  
  // Add payroll item
  addPayrollItem(item: Omit<PayrollItem, 'id'>): Promise<PayrollItem>;
  
  // Update payroll item
  updatePayrollItem(id: string, updates: Partial<PayrollItem>): Promise<PayrollItem | null>;
  
  // Delete payroll item
  deletePayrollItem(id: string): Promise<boolean>;
  
  // Clear all items for a run (for recalculation)
  clearPayrollItems(runId: string): Promise<boolean>;
  
  // ============================================
  // PAYSLIPS
  // ============================================
  
  // Get all payslips for user
  getPayslipsByUser(userId: string): Promise<Payslip[]>;
  
  // Get payslip by ID
  getPayslipById(id: string): Promise<Payslip | null>;
  
  // Create payslip (on finalize)
  createPayslip(payslip: Omit<Payslip, 'id' | 'createdAt'>): Promise<Payslip>;
  
  // Get payslips for a run
  getPayslipsByRun(runId: string): Promise<Payslip[]>;
}
