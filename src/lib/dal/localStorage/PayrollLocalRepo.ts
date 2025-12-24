import { PayrollRepo } from '../interfaces/PayrollRepo';
import { PayrollRun, PayrollItem, Payslip } from '../types';
import { delay, generateId, now, storageGet, storageSet } from '../utils';
import { seedPayrollRuns, seedPayrollItems, seedPayslips } from '../seed/seedData';

const PAYROLL_RUNS_KEY = 'payroll_runs';
const PAYROLL_ITEMS_KEY = 'payroll_items';
const PAYSLIPS_KEY = 'payslips';

export class PayrollLocalRepo implements PayrollRepo {
  private getPayrollRuns(): PayrollRun[] {
    return storageGet<PayrollRun[]>(PAYROLL_RUNS_KEY, seedPayrollRuns);
  }

  private savePayrollRuns(runs: PayrollRun[]): void {
    storageSet(PAYROLL_RUNS_KEY, runs);
  }

  private getPayrollItemsData(): PayrollItem[] {
    return storageGet<PayrollItem[]>(PAYROLL_ITEMS_KEY, seedPayrollItems);
  }

  private savePayrollItemsData(items: PayrollItem[]): void {
    storageSet(PAYROLL_ITEMS_KEY, items);
  }

  private getPayslipsData(): Payslip[] {
    return storageGet<Payslip[]>(PAYSLIPS_KEY, seedPayslips);
  }

  private savePayslipsData(payslips: Payslip[]): void {
    storageSet(PAYSLIPS_KEY, payslips);
  }

  // ============================================
  // PAYROLL RUNS
  // ============================================

  async getAllPayrollRuns(): Promise<PayrollRun[]> {
    await delay();
    return this.getPayrollRuns().sort((a, b) => b.month.localeCompare(a.month));
  }

  async getPayrollRunById(id: string): Promise<PayrollRun | null> {
    await delay();
    return this.getPayrollRuns().find(r => r.id === id) || null;
  }

  async getPayrollRunByMonth(month: string): Promise<PayrollRun | null> {
    await delay();
    return this.getPayrollRuns().find(r => r.month === month) || null;
  }

  async createPayrollRun(month: string): Promise<PayrollRun> {
    await delay();
    const runs = this.getPayrollRuns();
    
    const newRun: PayrollRun = {
      id: generateId(),
      month,
      status: 'Draft',
      createdAt: now(),
    };
    
    runs.push(newRun);
    this.savePayrollRuns(runs);
    
    return newRun;
  }

  async finalizePayrollRun(id: string): Promise<PayrollRun | null> {
    await delay();
    const runs = this.getPayrollRuns();
    const index = runs.findIndex(r => r.id === id);
    
    if (index === -1) {
      return null;
    }
    
    runs[index] = {
      ...runs[index],
      status: 'Finalized',
      finalizedAt: now(),
    };
    
    this.savePayrollRuns(runs);
    return runs[index];
  }

  async deletePayrollRun(id: string): Promise<boolean> {
    await delay();
    const runs = this.getPayrollRuns();
    const run = runs.find(r => r.id === id);
    
    if (!run || run.status === 'Finalized') {
      return false;
    }
    
    const filtered = runs.filter(r => r.id !== id);
    this.savePayrollRuns(filtered);
    
    // Also delete related items
    const items = this.getPayrollItemsData().filter(i => i.runId !== id);
    this.savePayrollItemsData(items);
    
    return true;
  }

  // ============================================
  // PAYROLL ITEMS
  // ============================================

  async getPayrollItems(runId: string): Promise<PayrollItem[]> {
    await delay();
    return this.getPayrollItemsData().filter(i => i.runId === runId);
  }

  async addPayrollItem(item: Omit<PayrollItem, 'id'>): Promise<PayrollItem> {
    await delay();
    const items = this.getPayrollItemsData();
    
    const newItem: PayrollItem = {
      ...item,
      id: generateId(),
    };
    
    items.push(newItem);
    this.savePayrollItemsData(items);
    
    return newItem;
  }

  async updatePayrollItem(id: string, updates: Partial<PayrollItem>): Promise<PayrollItem | null> {
    await delay();
    const items = this.getPayrollItemsData();
    const index = items.findIndex(i => i.id === id);
    
    if (index === -1) {
      return null;
    }
    
    items[index] = { ...items[index], ...updates };
    this.savePayrollItemsData(items);
    
    return items[index];
  }

  async deletePayrollItem(id: string): Promise<boolean> {
    await delay();
    const items = this.getPayrollItemsData();
    const filtered = items.filter(i => i.id !== id);
    
    if (filtered.length === items.length) {
      return false;
    }
    
    this.savePayrollItemsData(filtered);
    return true;
  }

  async clearPayrollItems(runId: string): Promise<boolean> {
    await delay();
    const items = this.getPayrollItemsData().filter(i => i.runId !== runId);
    this.savePayrollItemsData(items);
    return true;
  }

  // ============================================
  // PAYSLIPS
  // ============================================

  async getPayslipsByUser(userId: string): Promise<Payslip[]> {
    await delay();
    return this.getPayslipsData()
      .filter(p => p.userId === userId)
      .sort((a, b) => b.month.localeCompare(a.month));
  }

  async getPayslipById(id: string): Promise<Payslip | null> {
    await delay();
    return this.getPayslipsData().find(p => p.id === id) || null;
  }

  async createPayslip(payslip: Omit<Payslip, 'id' | 'createdAt'>): Promise<Payslip> {
    await delay();
    const payslips = this.getPayslipsData();
    
    const newPayslip: Payslip = {
      ...payslip,
      id: generateId(),
      createdAt: now(),
    };
    
    payslips.push(newPayslip);
    this.savePayslipsData(payslips);
    
    return newPayslip;
  }

  async getPayslipsByRun(runId: string): Promise<Payslip[]> {
    await delay();
    return this.getPayslipsData().filter(p => p.runId === runId);
  }
}

export const payrollLocalRepo = new PayrollLocalRepo();
