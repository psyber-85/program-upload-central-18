import { Invoice, Bill, InvoiceStatus, BillStatus, BusinessArm, AppSettings } from '../types';

export interface EntriesRepo {
  // ============================================
  // INVOICES
  // ============================================
  
  // Get all invoices (admin)
  getAllInvoices(): Promise<Invoice[]>;
  
  // Get invoices by user (staff - own only)
  getInvoicesByUser(userId: string): Promise<Invoice[]>;
  
  // Get invoice by ID
  getInvoiceById(id: string): Promise<Invoice | null>;
  
  // Create invoice
  createInvoice(invoice: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt' | 'invoiceNumber'>): Promise<Invoice>;
  
  // Update invoice
  updateInvoice(id: string, updates: Partial<Invoice>): Promise<Invoice | null>;
  
  // Update invoice status
  updateInvoiceStatus(id: string, status: InvoiceStatus, paidDate?: string): Promise<Invoice | null>;
  
  // Mark invoice as paid
  markInvoicePaid(id: string, paidDate: string): Promise<Invoice | null>;
  
  // Get paid invoices for month (for revenue calculation)
  getPaidInvoicesForMonth(month: string): Promise<Invoice[]>;
  
  // Get unpaid invoices count
  getUnpaidInvoicesCount(): Promise<number>;
  
  // ============================================
  // BILLS
  // ============================================
  
  // Get all bills (admin)
  getAllBills(): Promise<Bill[]>;
  
  // Get bills by user (staff - own only)
  getBillsByUser(userId: string): Promise<Bill[]>;
  
  // Get bill by ID
  getBillById(id: string): Promise<Bill | null>;
  
  // Create bill
  createBill(bill: Omit<Bill, 'id' | 'createdAt' | 'updatedAt'>): Promise<Bill>;
  
  // Update bill
  updateBill(id: string, updates: Partial<Bill>): Promise<Bill | null>;
  
  // Update bill status
  updateBillStatus(id: string, status: BillStatus, paidDate?: string): Promise<Bill | null>;
  
  // Mark bill as paid
  markBillPaid(id: string, paidDate: string): Promise<Bill | null>;
  
  // Get paid bills for month (for expense calculation)
  getPaidBillsForMonth(month: string): Promise<Bill[]>;
  
  // Get upcoming bills due
  getUpcomingBillsDue(days?: number): Promise<Bill[]>;
  
  // ============================================
  // SETTINGS
  // ============================================
  
  // Get app settings
  getSettings(): Promise<AppSettings>;
  
  // Update app settings
  updateSettings(updates: Partial<AppSettings>): Promise<AppSettings>;
  
  // Get next invoice number
  getNextInvoiceNumber(): Promise<string>;
}
