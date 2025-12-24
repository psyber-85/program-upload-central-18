import { EntriesRepo } from '../interfaces/EntriesRepo';
import { Invoice, Bill, InvoiceStatus, BillStatus, AppSettings } from '../types';
import { delay, generateId, now, storageGet, storageSet, getMonthFromDate } from '../utils';
import { seedInvoices, seedBills, seedSettings } from '../seed/seedData';

const INVOICES_KEY = 'invoices';
const BILLS_KEY = 'bills';
const SETTINGS_KEY = 'app_settings';

export class EntriesLocalRepo implements EntriesRepo {
  private getInvoices(): Invoice[] {
    return storageGet<Invoice[]>(INVOICES_KEY, seedInvoices);
  }

  private saveInvoices(invoices: Invoice[]): void {
    storageSet(INVOICES_KEY, invoices);
  }

  private getBills(): Bill[] {
    return storageGet<Bill[]>(BILLS_KEY, seedBills);
  }

  private saveBills(bills: Bill[]): void {
    storageSet(BILLS_KEY, bills);
  }

  private getSettingsData(): AppSettings {
    return storageGet<AppSettings>(SETTINGS_KEY, seedSettings);
  }

  private saveSettings(settings: AppSettings): void {
    storageSet(SETTINGS_KEY, settings);
  }

  // ============================================
  // INVOICES
  // ============================================

  async getAllInvoices(): Promise<Invoice[]> {
    await delay();
    return this.getInvoices().sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getInvoicesByUser(userId: string): Promise<Invoice[]> {
    await delay();
    return this.getInvoices()
      .filter(i => i.createdBy === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getInvoiceById(id: string): Promise<Invoice | null> {
    await delay();
    return this.getInvoices().find(i => i.id === id) || null;
  }

  async createInvoice(invoice: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt' | 'invoiceNumber'>): Promise<Invoice> {
    await delay();
    const invoices = this.getInvoices();
    const invoiceNumber = await this.getNextInvoiceNumber();
    
    const newInvoice: Invoice = {
      ...invoice,
      id: generateId(),
      invoiceNumber,
      createdAt: now(),
      updatedAt: now(),
    };
    
    invoices.push(newInvoice);
    this.saveInvoices(invoices);
    
    return newInvoice;
  }

  async updateInvoice(id: string, updates: Partial<Invoice>): Promise<Invoice | null> {
    await delay();
    const invoices = this.getInvoices();
    const index = invoices.findIndex(i => i.id === id);
    
    if (index === -1) {
      return null;
    }
    
    invoices[index] = { 
      ...invoices[index], 
      ...updates, 
      updatedAt: now() 
    };
    this.saveInvoices(invoices);
    
    return invoices[index];
  }

  async updateInvoiceStatus(id: string, status: InvoiceStatus, paidDate?: string): Promise<Invoice | null> {
    await delay();
    return this.updateInvoice(id, { status, paidDate });
  }

  async markInvoicePaid(id: string, paidDate: string): Promise<Invoice | null> {
    return this.updateInvoiceStatus(id, 'Paid', paidDate);
  }

  async markInvoiceSent(id: string): Promise<Invoice | null> {
    return this.updateInvoiceStatus(id, 'Sent');
  }

  async getPaidInvoicesForMonth(month: string): Promise<Invoice[]> {
    await delay();
    return this.getInvoices().filter(i => 
      i.status === 'Paid' && 
      i.paidDate && 
      getMonthFromDate(i.paidDate) === month
    );
  }

  async getUnpaidInvoicesCount(): Promise<number> {
    await delay();
    return this.getInvoices().filter(i => i.status !== 'Paid').length;
  }

  // ============================================
  // BILLS
  // ============================================

  async getAllBills(): Promise<Bill[]> {
    await delay();
    return this.getBills().sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getBillsByUser(userId: string): Promise<Bill[]> {
    await delay();
    return this.getBills()
      .filter(b => b.createdBy === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getBillById(id: string): Promise<Bill | null> {
    await delay();
    return this.getBills().find(b => b.id === id) || null;
  }

  async createBill(bill: Omit<Bill, 'id' | 'createdAt' | 'updatedAt'>): Promise<Bill> {
    await delay();
    const bills = this.getBills();
    
    const newBill: Bill = {
      ...bill,
      id: generateId(),
      createdAt: now(),
      updatedAt: now(),
    };
    
    bills.push(newBill);
    this.saveBills(bills);
    
    return newBill;
  }

  async updateBill(id: string, updates: Partial<Bill>): Promise<Bill | null> {
    await delay();
    const bills = this.getBills();
    const index = bills.findIndex(b => b.id === id);
    
    if (index === -1) {
      return null;
    }
    
    bills[index] = { 
      ...bills[index], 
      ...updates, 
      updatedAt: now() 
    };
    this.saveBills(bills);
    
    return bills[index];
  }

  async updateBillStatus(id: string, status: BillStatus, paidDate?: string): Promise<Bill | null> {
    return this.updateBill(id, { status, paidDate });
  }

  async markBillPaid(id: string, paidDate: string): Promise<Bill | null> {
    return this.updateBillStatus(id, 'Paid', paidDate);
  }

  async getPaidBillsForMonth(month: string): Promise<Bill[]> {
    await delay();
    return this.getBills().filter(b => 
      b.status === 'Paid' && 
      b.paidDate && 
      getMonthFromDate(b.paidDate) === month
    );
  }

  async getUpcomingBillsDue(days: number = 7): Promise<Bill[]> {
    await delay();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    
    return this.getBills().filter(b => 
      b.status !== 'Paid' && 
      b.dueDate && 
      new Date(b.dueDate) <= futureDate
    ).sort((a, b) => 
      new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime()
    );
  }

  // ============================================
  // SETTINGS
  // ============================================

  async getSettings(): Promise<AppSettings> {
    await delay();
    return this.getSettingsData();
  }

  async updateSettings(updates: Partial<AppSettings>): Promise<AppSettings> {
    await delay();
    const settings = this.getSettingsData();
    const updated = { ...settings, ...updates };
    this.saveSettings(updated);
    return updated;
  }

  async getNextInvoiceNumber(): Promise<string> {
    const settings = this.getSettingsData();
    const currentYear = new Date().getFullYear();
    
    // Reset counter if new year
    if (settings.invoiceCounterYear !== currentYear) {
      settings.invoiceCounterYear = currentYear;
      settings.invoiceCounter = 0;
    }
    
    settings.invoiceCounter += 1;
    this.saveSettings(settings);
    
    return `INV${String(settings.invoiceCounter).padStart(5, '0')}`;
  }
}

export const entriesLocalRepo = new EntriesLocalRepo();
