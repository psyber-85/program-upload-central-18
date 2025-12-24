import { Invoice, Bill, Quotation, PurchaseOrder, Payment, InvoiceStatus, BillStatus, QuotationStatus, POStatus, AppSettings } from '../types';

export interface EntriesRepo {
  // ============================================
  // INVOICES
  // ============================================
  
  getAllInvoices(): Promise<Invoice[]>;
  getInvoicesByUser(userId: string): Promise<Invoice[]>;
  getInvoiceById(id: string): Promise<Invoice | null>;
  createInvoice(invoice: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt' | 'invoiceNumber'>): Promise<Invoice>;
  updateInvoice(id: string, updates: Partial<Invoice>): Promise<Invoice | null>;
  updateInvoiceStatus(id: string, status: InvoiceStatus, paidDate?: string): Promise<Invoice | null>;
  markInvoicePaid(id: string, paidDate: string): Promise<Invoice | null>;
  markInvoiceSent(id: string): Promise<Invoice | null>;
  getPaidInvoicesForMonth(month: string): Promise<Invoice[]>;
  getUnpaidInvoicesCount(): Promise<number>;
  getNextInvoiceNumber(): Promise<string>;
  
  // ============================================
  // QUOTATIONS
  // ============================================
  
  getAllQuotations(): Promise<Quotation[]>;
  getQuotationsByUser(userId: string): Promise<Quotation[]>;
  getQuotationById(id: string): Promise<Quotation | null>;
  createQuotation(quotation: Omit<Quotation, 'id' | 'createdAt' | 'updatedAt' | 'quotationNumber'>): Promise<Quotation>;
  updateQuotation(id: string, updates: Partial<Quotation>): Promise<Quotation | null>;
  updateQuotationStatus(id: string, status: QuotationStatus): Promise<Quotation | null>;
  convertQuotationToInvoice(quotationId: string): Promise<Invoice | null>;
  getNextQuotationNumber(): Promise<string>;
  
  // ============================================
  // BILLS
  // ============================================
  
  getAllBills(): Promise<Bill[]>;
  getBillsByUser(userId: string): Promise<Bill[]>;
  getBillById(id: string): Promise<Bill | null>;
  createBill(bill: Omit<Bill, 'id' | 'createdAt' | 'updatedAt'>): Promise<Bill>;
  updateBill(id: string, updates: Partial<Bill>): Promise<Bill | null>;
  updateBillStatus(id: string, status: BillStatus, paidDate?: string): Promise<Bill | null>;
  markBillPaid(id: string, paidDate: string): Promise<Bill | null>;
  getPaidBillsForMonth(month: string): Promise<Bill[]>;
  getUpcomingBillsDue(days?: number): Promise<Bill[]>;
  
  // ============================================
  // PURCHASE ORDERS
  // ============================================
  
  getAllPurchaseOrders(): Promise<PurchaseOrder[]>;
  getPurchaseOrderById(id: string): Promise<PurchaseOrder | null>;
  createPurchaseOrder(po: Omit<PurchaseOrder, 'id' | 'createdAt' | 'updatedAt' | 'poNumber'>): Promise<PurchaseOrder>;
  updatePurchaseOrder(id: string, updates: Partial<PurchaseOrder>): Promise<PurchaseOrder | null>;
  updatePurchaseOrderStatus(id: string, status: POStatus): Promise<PurchaseOrder | null>;
  getNextPONumber(): Promise<string>;
  
  // ============================================
  // PAYMENTS
  // ============================================
  
  getAllPayments(): Promise<Payment[]>;
  getPaymentById(id: string): Promise<Payment | null>;
  createPayment(payment: Omit<Payment, 'id' | 'createdAt' | 'paymentNumber'>): Promise<Payment>;
  getPaymentsForMonth(month: string): Promise<Payment[]>;
  getNextPaymentNumber(): Promise<string>;
  
  // ============================================
  // SETTINGS
  // ============================================
  
  getSettings(): Promise<AppSettings>;
  updateSettings(updates: Partial<AppSettings>): Promise<AppSettings>;
}
