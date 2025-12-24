import { CompanyStats, MonthlyStats } from '../types';

export interface StatsRepo {
  // Get company stats for current month + trend
  getCompanyStats(): Promise<CompanyStats>;
  
  // Get stats for a specific month
  getMonthlyStats(month: string): Promise<MonthlyStats>;
  
  // Get revenue breakdown for month
  getRevenueBreakdown(month: string): Promise<{
    total: number;
    training: number;
    solutions: number;
  }>;
  
  // Get expenses breakdown for month
  getExpensesBreakdown(month: string): Promise<{
    total: number;
    payroll: number;
    bills: number;
  }>;
  
  // Get trend data (last N months)
  getTrend(months: number): Promise<MonthlyStats[]>;
}
