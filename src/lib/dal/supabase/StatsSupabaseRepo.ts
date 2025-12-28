import { supabase } from '@/integrations/supabase/client';
import { CompanyStats, MonthlyStats } from '../types';
import { StatsRepo } from '../interfaces/StatsRepo';
import { format, subMonths } from 'date-fns';

class StatsSupabaseRepo implements StatsRepo {

  async getCompanyStats(): Promise<CompanyStats> {
    const currentMonth = format(new Date(), 'yyyy-MM');
    const currentStats = await this.getMonthlyStats(currentMonth);
    const trend = await this.getTrend(6);

    return {
      currentMonth: currentStats,
      trend,
    };
  }

  async getMonthlyStats(month: string): Promise<MonthlyStats> {
    const [revenue, expenses] = await Promise.all([
      this.getRevenueBreakdown(month),
      this.getExpensesBreakdown(month),
    ]);

    return {
      month,
      revenue: revenue.total,
      revenueTraining: revenue.training,
      revenueSolutions: revenue.solutions,
      expenses: expenses.total,
      expensesPayroll: expenses.payroll,
      expensesBills: expenses.bills,
    };
  }

  async getRevenueBreakdown(month: string): Promise<{
    total: number;
    training: number;
    solutions: number;
  }> {
    const startDate = `${month}-01`;
    const [year, monthNum] = month.split('-').map(Number);
    const nextMonth = monthNum === 12 ? `${year + 1}-01` : `${year}-${String(monthNum + 1).padStart(2, '0')}`;
    const endDate = `${nextMonth}-01`;

    const { data: invoices } = await supabase
      .from('sp_invoices')
      .select('total, business_arm')
      .eq('status', 'Paid')
      .gte('paid_date', startDate)
      .lt('paid_date', endDate);

    let training = 0;
    let solutions = 0;

    invoices?.forEach(inv => {
      const amount = Number(inv.total) || 0;
      if (inv.business_arm === 'Training') {
        training += amount;
      } else if (inv.business_arm === 'Solutions') {
        solutions += amount;
      } else {
        training += amount; // Default to training
      }
    });

    return {
      total: training + solutions,
      training,
      solutions,
    };
  }

  async getExpensesBreakdown(month: string): Promise<{
    total: number;
    payroll: number;
    bills: number;
  }> {
    const startDate = `${month}-01`;
    const [year, monthNum] = month.split('-').map(Number);
    const nextMonth = monthNum === 12 ? `${year + 1}-01` : `${year}-${String(monthNum + 1).padStart(2, '0')}`;
    const endDate = `${nextMonth}-01`;

    // Get payroll expenses
    const { data: payrollRun } = await supabase
      .from('sp_payroll_runs')
      .select('id')
      .eq('month', month)
      .eq('status', 'Finalized')
      .maybeSingle();

    let payrollTotal = 0;
    if (payrollRun) {
      const { data: payrollItems } = await supabase
        .from('sp_payroll_items')
        .select('total_company_cost')
        .eq('run_id', payrollRun.id);

      payrollItems?.forEach(item => {
        payrollTotal += Number(item.total_company_cost) || 0;
      });
    }

    // Get bills paid in this month
    const { data: bills } = await supabase
      .from('sp_bills')
      .select('amount')
      .eq('status', 'Paid')
      .gte('paid_date', startDate)
      .lt('paid_date', endDate);

    let billsTotal = 0;
    bills?.forEach(bill => {
      billsTotal += Number(bill.amount) || 0;
    });

    return {
      total: payrollTotal + billsTotal,
      payroll: payrollTotal,
      bills: billsTotal,
    };
  }

  async getTrend(months: number): Promise<MonthlyStats[]> {
    const trend: MonthlyStats[] = [];
    const now = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const date = subMonths(now, i);
      const month = format(date, 'yyyy-MM');
      const stats = await this.getMonthlyStats(month);
      trend.push(stats);
    }

    return trend;
  }
}

export const statsSupabaseRepo = new StatsSupabaseRepo();
