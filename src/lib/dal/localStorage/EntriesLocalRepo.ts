import { EntriesRepo } from '../interfaces/EntriesRepo';
import { Invoice, Bill, Quotation, PurchaseOrder, Payment, InvoiceStatus, BillStatus, QuotationStatus, POStatus, AppSettings } from '../types';
import { delay, generateId, now, storageGet, storageSet, getMonthFromDate } from '../utils';
import { seedInvoices, seedBills, seedQuotations, seedSettings, seedPurchaseOrders, seedPayments } from '../seed/seedData';

const INVOICES_KEY = 'invoices';
const BILLS_KEY = 'bills';
const QUOTATIONS_KEY = 'quotations';
const PURCHASE_ORDERS_KEY = 'purchase_orders';
const PAYMENTS_KEY = 'payments';
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

  private getQuotations(): Quotation[] {
    return storageGet<Quotation[]>(QUOTATIONS_KEY, seedQuotations);
  }

  private saveQuotations(quotations: Quotation[]): void {
    storageSet(QUOTATIONS_KEY, quotations);
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
  // QUOTATIONS
  // ============================================

  async getAllQuotations(): Promise<Quotation[]> {
    await delay();
    return this.getQuotations().sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getQuotationsByUser(userId: string): Promise<Quotation[]> {
    await delay();
    return this.getQuotations()
      .filter(q => q.createdBy === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getQuotationById(id: string): Promise<Quotation | null> {
    await delay();
    return this.getQuotations().find(q => q.id === id) || null;
  }

  async createQuotation(quotation: Omit<Quotation, 'id' | 'createdAt' | 'updatedAt' | 'quotationNumber'>): Promise<Quotation> {
    await delay();
    const quotations = this.getQuotations();
    const quotationNumber = await this.getNextQuotationNumber();
    
    const newQuotation: Quotation = {
      ...quotation,
      id: generateId(),
      quotationNumber,
      createdAt: now(),
      updatedAt: now(),
    };
    
    quotations.push(newQuotation);
    this.saveQuotations(quotations);
    
    return newQuotation;
  }

  async updateQuotation(id: string, updates: Partial<Quotation>): Promise<Quotation | null> {
    await delay();
    const quotations = this.getQuotations();
    const index = quotations.findIndex(q => q.id === id);
    
    if (index === -1) {
      return null;
    }
    
    quotations[index] = { 
      ...quotations[index], 
      ...updates, 
      updatedAt: now() 
    };
    this.saveQuotations(quotations);
    
    return quotations[index];
  }

  async updateQuotationStatus(id: string, status: QuotationStatus): Promise<Quotation | null> {
    return this.updateQuotation(id, { status });
  }

  async convertQuotationToInvoice(quotationId: string): Promise<Invoice | null> {
    await delay();
    const quotation = await this.getQuotationById(quotationId);
    if (!quotation || quotation.status === 'Converted') {
      return null;
    }

    // Create invoice from quotation
    const invoice = await this.createInvoice({
      createdBy: quotation.createdBy,
      creatorName: quotation.creatorName,
      businessArm: quotation.businessArm,
      clientName: quotation.clientName,
      issueDate: now().split('T')[0],
      status: 'Draft',
      items: quotation.items,
      total: quotation.total,
      quotationId: quotation.id,
    });

    // Update quotation status
    await this.updateQuotation(quotationId, { 
      status: 'Converted', 
      convertedInvoiceId: invoice.id 
    });

    return invoice;
  }

  async getNextQuotationNumber(): Promise<string> {
    const settings = this.getSettingsData();
    const currentYear = new Date().getFullYear();
    
    // Use quotationCounter if exists, else default to 0
    let counter = (settings as any).quotationCounter || 0;
    let counterYear = (settings as any).quotationCounterYear || currentYear;
    
    // Reset counter if new year
    if (counterYear !== currentYear) {
      counterYear = currentYear;
      counter = 0;
    }
    
    counter += 1;
    this.saveSettings({ 
      ...settings, 
      quotationCounter: counter, 
      quotationCounterYear: counterYear 
    } as any);
    
    return `QUO${String(counter).padStart(5, '0')}`;
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
  // PURCHASE ORDERS
  // ============================================

  private getPurchaseOrders(): PurchaseOrder[] {
    return storageGet<PurchaseOrder[]>(PURCHASE_ORDERS_KEY, seedPurchaseOrders);
  }

  private savePurchaseOrders(pos: PurchaseOrder[]): void {
    storageSet(PURCHASE_ORDERS_KEY, pos);
  }

  async getAllPurchaseOrders(): Promise<PurchaseOrder[]> {
    await delay();
    return this.getPurchaseOrders().sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getPurchaseOrderById(id: string): Promise<PurchaseOrder | null> {
    await delay();
    return this.getPurchaseOrders().find(p => p.id === id) || null;
  }

  async createPurchaseOrder(po: Omit<PurchaseOrder, 'id' | 'createdAt' | 'updatedAt' | 'poNumber'>): Promise<PurchaseOrder> {
    await delay();
    const pos = this.getPurchaseOrders();
    const poNumber = await this.getNextPONumber();
    
    const newPO: PurchaseOrder = {
      ...po,
      id: generateId(),
      poNumber,
      createdAt: now(),
      updatedAt: now(),
    };
    
    pos.push(newPO);
    this.savePurchaseOrders(pos);
    
    return newPO;
  }

  async updatePurchaseOrder(id: string, updates: Partial<PurchaseOrder>): Promise<PurchaseOrder | null> {
    await delay();
    const pos = this.getPurchaseOrders();
    const index = pos.findIndex(p => p.id === id);
    
    if (index === -1) {
      return null;
    }
    
    pos[index] = { 
      ...pos[index], 
      ...updates, 
      updatedAt: now() 
    };
    this.savePurchaseOrders(pos);
    
    return pos[index];
  }

  async updatePurchaseOrderStatus(id: string, status: POStatus): Promise<PurchaseOrder | null> {
    return this.updatePurchaseOrder(id, { status });
  }

  async getNextPONumber(): Promise<string> {
    const settings = this.getSettingsData() as any;
    const currentYear = new Date().getFullYear();
    
    let counter = settings.poCounter || 0;
    let counterYear = settings.poCounterYear || currentYear;
    
    if (counterYear !== currentYear) {
      counterYear = currentYear;
      counter = 0;
    }
    
    counter += 1;
    this.saveSettings({ 
      ...settings, 
      poCounter: counter, 
      poCounterYear: counterYear 
    } as any);
    
    return `PO${String(counter).padStart(5, '0')}`;
  }

  // ============================================
  // PAYMENTS
  // ============================================

  private getPayments(): Payment[] {
    return storageGet<Payment[]>(PAYMENTS_KEY, seedPayments);
  }

  private savePayments(payments: Payment[]): void {
    storageSet(PAYMENTS_KEY, payments);
  }

  async getAllPayments(): Promise<Payment[]> {
    await delay();
    return this.getPayments().sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getPaymentById(id: string): Promise<Payment | null> {
    await delay();
    return this.getPayments().find(p => p.id === id) || null;
  }

  async createPayment(payment: Omit<Payment, 'id' | 'createdAt' | 'paymentNumber'>): Promise<Payment> {
    await delay();
    const payments = this.getPayments();
    const paymentNumber = await this.getNextPaymentNumber();
    
    const newPayment: Payment = {
      ...payment,
      id: generateId(),
      paymentNumber,
      createdAt: now(),
    };
    
    payments.push(newPayment);
    this.savePayments(payments);
    
    return newPayment;
  }

  async getPaymentsForMonth(month: string): Promise<Payment[]> {
    await delay();
    return this.getPayments().filter(p => 
      getMonthFromDate(p.paymentDate) === month
    );
  }

  async getNextPaymentNumber(): Promise<string> {
    const settings = this.getSettingsData() as any;
    const currentYear = new Date().getFullYear();
    
    let counter = settings.paymentCounter || 0;
    let counterYear = settings.paymentCounterYear || currentYear;
    
    if (counterYear !== currentYear) {
      counterYear = currentYear;
      counter = 0;
    }
    
    counter += 1;
    this.saveSettings({ 
      ...settings, 
      paymentCounter: counter, 
      paymentCounterYear: counterYear 
    } as any);
    
    return `PAY${String(counter).padStart(5, '0')}`;
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
