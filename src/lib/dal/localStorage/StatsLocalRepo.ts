import { StatsRepo } from '../interfaces/StatsRepo';
import { CompanyStats, MonthlyStats } from '../types';
import { delay, getCurrentMonth, storageGet } from '../utils';
import { seedInvoices, seedBills, seedPayrollRuns, seedPayrollItems } from '../seed/seedData';

const INVOICES_KEY = 'invoices';
const BILLS_KEY = 'bills';
const PAYROLL_RUNS_KEY = 'payroll_runs';
const PAYROLL_ITEMS_KEY = 'payroll_items';

export class StatsLocalRepo implements StatsRepo {
  private getInvoices() {
    return storageGet(INVOICES_KEY, seedInvoices);
  }

  private getBills() {
    return storageGet(BILLS_KEY, seedBills);
  }

  private getPayrollRuns() {
    return storageGet(PAYROLL_RUNS_KEY, seedPayrollRuns);
  }

  private getPayrollItems() {
    return storageGet(PAYROLL_ITEMS_KEY, seedPayrollItems);
  }

  async getMonthlyStats(month: string): Promise<MonthlyStats> {
    await delay();
    
    const invoices = this.getInvoices();
    const bills = this.getBills();
    const payrollRuns = this.getPayrollRuns();
    const payrollItems = this.getPayrollItems();
    
    // Revenue from paid invoices
    const paidInvoices = invoices.filter(i => 
      i.status === 'Paid' && 
      i.paidDate && 
      i.paidDate.slice(0, 7) === month
    );
    
    const revenue = paidInvoices.reduce((sum, i) => sum + i.total, 0);
    const revenueTraining = paidInvoices
      .filter(i => i.businessArm === 'Training')
      .reduce((sum, i) => sum + i.total, 0);
    const revenueSolutions = paidInvoices
      .filter(i => i.businessArm === 'Solutions')
      .reduce((sum, i) => sum + i.total, 0);
    
    // Expenses from bills
    const paidBills = bills.filter(b => 
      b.status === 'Paid' && 
      b.paidDate && 
      b.paidDate.slice(0, 7) === month
    );
    const expensesBills = paidBills.reduce((sum, b) => sum + b.amount, 0);
    
    // Expenses from payroll
    const finalizedRun = payrollRuns.find(r => 
      r.month === month && 
      r.status === 'Finalized'
    );
    
    let expensesPayroll = 0;
    if (finalizedRun) {
      const items = payrollItems.filter(i => i.runId === finalizedRun.id);
      expensesPayroll = items.reduce((sum, item) => 
        sum + item.baseSalary + item.epf + item.socso + item.claimsTotal + item.trainingClaimsTotal, 0
      );
    }
    
    const expenses = expensesBills + expensesPayroll;
    
    return {
      month,
      revenue,
      revenueTraining,
      revenueSolutions,
      expenses,
      expensesPayroll,
      expensesBills,
    };
  }

  async getRevenueBreakdown(month: string): Promise<{
    total: number;
    training: number;
    solutions: number;
  }> {
    const stats = await this.getMonthlyStats(month);
    return {
      total: stats.revenue,
      training: stats.revenueTraining,
      solutions: stats.revenueSolutions,
    };
  }

  async getExpensesBreakdown(month: string): Promise<{
    total: number;
    payroll: number;
    bills: number;
  }> {
    const stats = await this.getMonthlyStats(month);
    return {
      total: stats.expenses,
      payroll: stats.expensesPayroll,
      bills: stats.expensesBills,
    };
  }

  async getTrend(months: number = 6): Promise<MonthlyStats[]> {
    await delay();
    
    const result: MonthlyStats[] = [];
    const today = new Date();
    
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const stats = await this.getMonthlyStats(month);
      result.push(stats);
    }
    
    return result;
  }

  async getCompanyStats(): Promise<CompanyStats> {
    await delay();
    
    const currentMonth = getCurrentMonth();
    const currentMonthStats = await this.getMonthlyStats(currentMonth);
    const trend = await this.getTrend(6);
    
    return {
      currentMonth: currentMonthStats,
      trend,
    };
  }
}

export const statsLocalRepo = new StatsLocalRepo();
