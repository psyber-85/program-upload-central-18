import { supabase } from '@/integrations/supabase/client';
import type { Json, Database } from '@/integrations/supabase/types';
import { 
  Invoice, 
  Bill, 
  Quotation, 
  PurchaseOrder, 
  Payment, 
  InvoiceStatus, 
  BillStatus, 
  QuotationStatus, 
  POStatus,
  PaymentStatus,
  InvoiceItem,
  AppSettings,
  BusinessArm,
  PaymentMethod
} from '../types';
import { EntriesRepo } from '../interfaces/EntriesRepo';

class EntriesSupabaseRepo implements EntriesRepo {

  // ============================================
  // INVOICES
  // ============================================

  async getAllInvoices(): Promise<Invoice[]> {
    const { data, error } = await supabase
      .from('sp_invoices')
      .select('*')
      .order('issue_date', { ascending: false });

    if (error || !data) return [];

    return data.map(this.mapInvoice);
  }

  async getInvoicesByUser(userId: string): Promise<Invoice[]> {
    const { data, error } = await supabase
      .from('sp_invoices')
      .select('*')
      .eq('created_by', userId)
      .order('issue_date', { ascending: false });

    if (error || !data) return [];

    return data.map(this.mapInvoice);
  }

  async getInvoiceById(id: string): Promise<Invoice | null> {
    const { data, error } = await supabase
      .from('sp_invoices')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) return null;

    return this.mapInvoice(data);
  }

  async createInvoice(invoice: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt' | 'invoiceNumber'>): Promise<Invoice> {
    const invoiceNumber = await this.getNextInvoiceNumber();
    
    const { data, error } = await supabase
      .from('sp_invoices')
      .insert([{
        created_by: invoice.createdBy,
        invoice_number: invoiceNumber,
        business_arm: invoice.businessArm,
        client_name: invoice.clientName,
        client_email: invoice.clientEmail,
        client_address: invoice.clientAddress,
        client_phone: invoice.clientPhone,
        reference: invoice.reference,
        payment_terms: invoice.paymentTerms,
        notes: invoice.notes,
        issue_date: invoice.issueDate,
        due_date: invoice.dueDate,
        status: invoice.status,
        items: invoice.items as unknown as Json,
        total: invoice.total,
        quotation_id: invoice.quotationId,
      }])
      .select()
      .single();

    if (error) throw new Error(error.message);

    return this.mapInvoice(data);
  }

  async updateInvoice(id: string, updates: Partial<Invoice>): Promise<Invoice | null> {
    const updateData: Record<string, unknown> = {};
    
    if (updates.businessArm !== undefined) updateData.business_arm = updates.businessArm;
    if (updates.clientName !== undefined) updateData.client_name = updates.clientName;
    if (updates.clientEmail !== undefined) updateData.client_email = updates.clientEmail;
    if (updates.clientAddress !== undefined) updateData.client_address = updates.clientAddress;
    if (updates.clientPhone !== undefined) updateData.client_phone = updates.clientPhone;
    if (updates.reference !== undefined) updateData.reference = updates.reference;
    if (updates.paymentTerms !== undefined) updateData.payment_terms = updates.paymentTerms;
    if (updates.notes !== undefined) updateData.notes = updates.notes;
    if (updates.issueDate !== undefined) updateData.issue_date = updates.issueDate;
    if (updates.dueDate !== undefined) updateData.due_date = updates.dueDate;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.items !== undefined) updateData.items = updates.items;
    if (updates.total !== undefined) updateData.total = updates.total;
    if (updates.paidDate !== undefined) updateData.paid_date = updates.paidDate;

    const { error } = await supabase
      .from('sp_invoices')
      .update(updateData)
      .eq('id', id);

    if (error) return null;

    return this.getInvoiceById(id);
  }

  async updateInvoiceStatus(id: string, status: InvoiceStatus, paidDate?: string): Promise<Invoice | null> {
    const updateData: Record<string, unknown> = { status };
    if (paidDate) updateData.paid_date = paidDate;

    const { error } = await supabase
      .from('sp_invoices')
      .update(updateData)
      .eq('id', id);

    if (error) return null;

    return this.getInvoiceById(id);
  }

  async markInvoicePaid(id: string, paidDate: string): Promise<Invoice | null> {
    return this.updateInvoiceStatus(id, 'Paid', paidDate);
  }

  async markInvoiceSent(id: string): Promise<Invoice | null> {
    return this.updateInvoiceStatus(id, 'Sent');
  }

  async getPaidInvoicesForMonth(month: string): Promise<Invoice[]> {
    const startDate = `${month}-01`;
    const [year, monthNum] = month.split('-').map(Number);
    const nextMonth = monthNum === 12 ? `${year + 1}-01` : `${year}-${String(monthNum + 1).padStart(2, '0')}`;
    const endDate = `${nextMonth}-01`;

    const { data, error } = await supabase
      .from('sp_invoices')
      .select('*')
      .eq('status', 'Paid')
      .gte('paid_date', startDate)
      .lt('paid_date', endDate);

    if (error || !data) return [];

    return data.map(this.mapInvoice);
  }

  async getUnpaidInvoicesCount(): Promise<number> {
    const { count, error } = await supabase
      .from('sp_invoices')
      .select('*', { count: 'exact', head: true })
      .neq('status', 'Paid');

    if (error) return 0;

    return count || 0;
  }

  async getNextInvoiceNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const { data } = await supabase
      .from('sp_app_settings')
      .select('value')
      .eq('key', 'invoice_counter')
      .maybeSingle();

    const current = (data?.value as { next?: number })?.next || 1001;
    
    // Update counter
    await supabase
      .from('sp_app_settings')
      .upsert({ 
        key: 'invoice_counter', 
        value: { next: current + 1 } 
      }, { onConflict: 'key' });

    return `INV-${year}-${String(current).padStart(4, '0')}`;
  }

  // ============================================
  // QUOTATIONS
  // ============================================

  async getAllQuotations(): Promise<Quotation[]> {
    const { data, error } = await supabase
      .from('sp_quotations')
      .select('*')
      .order('issue_date', { ascending: false });

    if (error || !data) return [];

    return data.map(this.mapQuotation);
  }

  async getQuotationsByUser(userId: string): Promise<Quotation[]> {
    const { data, error } = await supabase
      .from('sp_quotations')
      .select('*')
      .eq('created_by', userId)
      .order('issue_date', { ascending: false });

    if (error || !data) return [];

    return data.map(this.mapQuotation);
  }

  async getQuotationById(id: string): Promise<Quotation | null> {
    const { data, error } = await supabase
      .from('sp_quotations')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) return null;

    return this.mapQuotation(data);
  }

  async createQuotation(quotation: Omit<Quotation, 'id' | 'createdAt' | 'updatedAt' | 'quotationNumber'>): Promise<Quotation> {
    const quotationNumber = await this.getNextQuotationNumber();
    
    const { data, error } = await supabase
      .from('sp_quotations')
      .insert([{
        created_by: quotation.createdBy,
        quotation_number: quotationNumber,
        business_arm: quotation.businessArm,
        client_name: quotation.clientName,
        client_email: quotation.clientEmail,
        client_address: quotation.clientAddress,
        client_phone: quotation.clientPhone,
        reference: quotation.reference,
        notes: quotation.notes,
        issue_date: quotation.issueDate,
        valid_until: quotation.validUntil,
        status: quotation.status,
        items: quotation.items as unknown as Json,
        total: quotation.total,
      }])
      .select()
      .single();

    if (error) throw new Error(error.message);

    return this.mapQuotation(data);
  }

  async updateQuotation(id: string, updates: Partial<Quotation>): Promise<Quotation | null> {
    const updateData: Record<string, unknown> = {};
    
    if (updates.businessArm !== undefined) updateData.business_arm = updates.businessArm;
    if (updates.clientName !== undefined) updateData.client_name = updates.clientName;
    if (updates.clientEmail !== undefined) updateData.client_email = updates.clientEmail;
    if (updates.clientAddress !== undefined) updateData.client_address = updates.clientAddress;
    if (updates.clientPhone !== undefined) updateData.client_phone = updates.clientPhone;
    if (updates.reference !== undefined) updateData.reference = updates.reference;
    if (updates.notes !== undefined) updateData.notes = updates.notes;
    if (updates.issueDate !== undefined) updateData.issue_date = updates.issueDate;
    if (updates.validUntil !== undefined) updateData.valid_until = updates.validUntil;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.items !== undefined) updateData.items = updates.items;
    if (updates.total !== undefined) updateData.total = updates.total;

    const { error } = await supabase
      .from('sp_quotations')
      .update(updateData)
      .eq('id', id);

    if (error) return null;

    return this.getQuotationById(id);
  }

  async updateQuotationStatus(id: string, status: QuotationStatus): Promise<Quotation | null> {
    const { error } = await supabase
      .from('sp_quotations')
      .update({ status })
      .eq('id', id);

    if (error) return null;

    return this.getQuotationById(id);
  }

  async convertQuotationToInvoice(quotationId: string): Promise<Invoice | null> {
    const quotation = await this.getQuotationById(quotationId);
    if (!quotation) return null;

    const invoice = await this.createInvoice({
      createdBy: quotation.createdBy,
      businessArm: quotation.businessArm,
      clientName: quotation.clientName,
      clientEmail: quotation.clientEmail,
      clientAddress: quotation.clientAddress,
      clientPhone: quotation.clientPhone,
      reference: quotation.reference,
      notes: quotation.notes,
      issueDate: new Date().toISOString().split('T')[0],
      status: 'Draft',
      items: quotation.items,
      total: quotation.total,
      quotationId,
    });

    // Update quotation status
    await supabase
      .from('sp_quotations')
      .update({ 
        status: 'Converted',
        converted_invoice_id: invoice.id,
      })
      .eq('id', quotationId);

    return invoice;
  }

  async getNextQuotationNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const { data } = await supabase
      .from('sp_app_settings')
      .select('value')
      .eq('key', 'quotation_counter')
      .maybeSingle();

    const current = (data?.value as { next?: number })?.next || 1001;
    
    await supabase
      .from('sp_app_settings')
      .upsert({ 
        key: 'quotation_counter', 
        value: { next: current + 1 } 
      }, { onConflict: 'key' });

    return `QUO-${year}-${String(current).padStart(4, '0')}`;
  }

  // ============================================
  // BILLS
  // ============================================

  async getAllBills(): Promise<Bill[]> {
    const { data, error } = await supabase
      .from('sp_bills')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) return [];

    return data.map(this.mapBill);
  }

  async getBillsByUser(userId: string): Promise<Bill[]> {
    const { data, error } = await supabase
      .from('sp_bills')
      .select('*')
      .eq('created_by', userId)
      .order('created_at', { ascending: false });

    if (error || !data) return [];

    return data.map(this.mapBill);
  }

  async getBillById(id: string): Promise<Bill | null> {
    const { data, error } = await supabase
      .from('sp_bills')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) return null;

    return this.mapBill(data);
  }

  async createBill(bill: Omit<Bill, 'id' | 'createdAt' | 'updatedAt'>): Promise<Bill> {
    const { data, error } = await supabase
      .from('sp_bills')
      .insert({
        created_by: bill.createdBy,
        vendor_name: bill.vendorName,
        category: bill.category,
        amount: bill.amount,
        due_date: bill.dueDate,
        status: bill.status,
        attachment_file_name: bill.attachmentMeta?.fileName,
        attachment_file_size: bill.attachmentMeta?.fileSize,
        attachment_file_type: bill.attachmentMeta?.fileType,
        attachment_uploaded_at: bill.attachmentMeta?.uploadedAt,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    return this.mapBill(data);
  }

  async updateBill(id: string, updates: Partial<Bill>): Promise<Bill | null> {
    const updateData: Record<string, unknown> = {};
    
    if (updates.vendorName !== undefined) updateData.vendor_name = updates.vendorName;
    if (updates.category !== undefined) updateData.category = updates.category;
    if (updates.amount !== undefined) updateData.amount = updates.amount;
    if (updates.dueDate !== undefined) updateData.due_date = updates.dueDate;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.paidDate !== undefined) updateData.paid_date = updates.paidDate;

    const { error } = await supabase
      .from('sp_bills')
      .update(updateData)
      .eq('id', id);

    if (error) return null;

    return this.getBillById(id);
  }

  async updateBillStatus(id: string, status: BillStatus, paidDate?: string): Promise<Bill | null> {
    const updateData: Record<string, unknown> = { status };
    if (paidDate) updateData.paid_date = paidDate;

    const { error } = await supabase
      .from('sp_bills')
      .update(updateData)
      .eq('id', id);

    if (error) return null;

    return this.getBillById(id);
  }

  async markBillPaid(id: string, paidDate: string): Promise<Bill | null> {
    return this.updateBillStatus(id, 'Paid', paidDate);
  }

  async getPaidBillsForMonth(month: string): Promise<Bill[]> {
    const startDate = `${month}-01`;
    const [year, monthNum] = month.split('-').map(Number);
    const nextMonth = monthNum === 12 ? `${year + 1}-01` : `${year}-${String(monthNum + 1).padStart(2, '0')}`;
    const endDate = `${nextMonth}-01`;

    const { data, error } = await supabase
      .from('sp_bills')
      .select('*')
      .eq('status', 'Paid')
      .gte('paid_date', startDate)
      .lt('paid_date', endDate);

    if (error || !data) return [];

    return data.map(this.mapBill);
  }

  async getUpcomingBillsDue(days: number = 7): Promise<Bill[]> {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + days);

    const { data, error } = await supabase
      .from('sp_bills')
      .select('*')
      .eq('status', 'Draft')
      .gte('due_date', today.toISOString().split('T')[0])
      .lte('due_date', futureDate.toISOString().split('T')[0]);

    if (error || !data) return [];

    return data.map(this.mapBill);
  }

  // ============================================
  // PURCHASE ORDERS
  // ============================================

  async getAllPurchaseOrders(): Promise<PurchaseOrder[]> {
    const { data, error } = await supabase
      .from('sp_purchase_orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) return [];

    return data.map(this.mapPurchaseOrder);
  }

  async getPurchaseOrderById(id: string): Promise<PurchaseOrder | null> {
    const { data, error } = await supabase
      .from('sp_purchase_orders')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) return null;

    return this.mapPurchaseOrder(data);
  }

  async createPurchaseOrder(po: Omit<PurchaseOrder, 'id' | 'createdAt' | 'updatedAt' | 'poNumber'>): Promise<PurchaseOrder> {
    const poNumber = await this.getNextPONumber();
    
    const { data, error } = await supabase
      .from('sp_purchase_orders')
      .insert([{
        created_by: po.createdBy,
        po_number: poNumber,
        vendor_name: po.vendorName,
        vendor_email: po.vendorEmail,
        vendor_address: po.vendorAddress,
        items: po.items as unknown as Json,
        total: po.total,
        status: po.status as Database['public']['Enums']['sp_po_status'],
        expected_delivery: po.expectedDelivery,
        notes: po.notes,
      }])
      .select()
      .single();

    if (error) throw new Error(error.message);

    return this.mapPurchaseOrder(data);
  }

  async updatePurchaseOrder(id: string, updates: Partial<PurchaseOrder>): Promise<PurchaseOrder | null> {
    const updateData: Record<string, unknown> = {};
    
    if (updates.vendorName !== undefined) updateData.vendor_name = updates.vendorName;
    if (updates.vendorEmail !== undefined) updateData.vendor_email = updates.vendorEmail;
    if (updates.vendorAddress !== undefined) updateData.vendor_address = updates.vendorAddress;
    if (updates.items !== undefined) updateData.items = updates.items;
    if (updates.total !== undefined) updateData.total = updates.total;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.expectedDelivery !== undefined) updateData.expected_delivery = updates.expectedDelivery;
    if (updates.notes !== undefined) updateData.notes = updates.notes;

    const { error } = await supabase
      .from('sp_purchase_orders')
      .update(updateData)
      .eq('id', id);

    if (error) return null;

    return this.getPurchaseOrderById(id);
  }

  async updatePurchaseOrderStatus(id: string, status: POStatus): Promise<PurchaseOrder | null> {
    const { error } = await supabase
      .from('sp_purchase_orders')
      .update({ status: status as Database['public']['Enums']['sp_po_status'] })
      .eq('id', id);

    if (error) return null;

    return this.getPurchaseOrderById(id);
  }

  async getNextPONumber(): Promise<string> {
    const year = new Date().getFullYear();
    const { data } = await supabase
      .from('sp_app_settings')
      .select('value')
      .eq('key', 'po_counter')
      .maybeSingle();

    const current = (data?.value as { next?: number })?.next || 1001;
    
    await supabase
      .from('sp_app_settings')
      .upsert({ 
        key: 'po_counter', 
        value: { next: current + 1 } 
      }, { onConflict: 'key' });

    return `PO-${year}-${String(current).padStart(4, '0')}`;
  }

  // ============================================
  // PAYMENTS
  // ============================================

  async getAllPayments(): Promise<Payment[]> {
    const { data, error } = await supabase
      .from('sp_payments')
      .select('*')
      .order('payment_date', { ascending: false });

    if (error || !data) return [];

    return data.map(this.mapPayment);
  }

  async getPaymentById(id: string): Promise<Payment | null> {
    const { data, error } = await supabase
      .from('sp_payments')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) return null;

    return this.mapPayment(data);
  }

  async createPayment(payment: Omit<Payment, 'id' | 'createdAt' | 'paymentNumber'>): Promise<Payment> {
    const paymentNumber = await this.getNextPaymentNumber();
    
    const { data, error } = await supabase
      .from('sp_payments')
      .insert({
        created_by: payment.createdBy,
        payment_number: paymentNumber,
        bill_id: payment.billId,
        po_id: payment.poId,
        vendor_name: payment.vendorName,
        amount: payment.amount,
        payment_date: payment.paymentDate,
        payment_method: payment.paymentMethod,
        reference: payment.reference,
        notes: payment.notes,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    return this.mapPayment(data);
  }

  async getPaymentsForMonth(month: string): Promise<Payment[]> {
    const startDate = `${month}-01`;
    const [year, monthNum] = month.split('-').map(Number);
    const nextMonth = monthNum === 12 ? `${year + 1}-01` : `${year}-${String(monthNum + 1).padStart(2, '0')}`;
    const endDate = `${nextMonth}-01`;

    const { data, error } = await supabase
      .from('sp_payments')
      .select('*')
      .gte('payment_date', startDate)
      .lt('payment_date', endDate);

    if (error || !data) return [];

    return data.map(this.mapPayment);
  }

  async getNextPaymentNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const { data } = await supabase
      .from('sp_app_settings')
      .select('value')
      .eq('key', 'payment_counter')
      .maybeSingle();

    const current = (data?.value as { next?: number })?.next || 1001;
    
    await supabase
      .from('sp_app_settings')
      .upsert({ 
        key: 'payment_counter', 
        value: { next: current + 1 } 
      }, { onConflict: 'key' });

    return `PAY-${year}-${String(current).padStart(4, '0')}`;
  }

  async updatePaymentStatus(id: string, status: PaymentStatus): Promise<Payment | null> {
    // Note: This requires adding a 'status' column to sp_payments table
    // For now, we'll just return the payment as-is since the column doesn't exist yet
    console.warn('updatePaymentStatus: status column not yet in database, returning payment as-is');
    return this.getPaymentById(id);
  }

  // ============================================
  // SETTINGS
  // ============================================

  async getSettings(): Promise<AppSettings> {
    const { data } = await supabase
      .from('sp_app_settings')
      .select('key, value')
      .in('key', ['invoice_counter']);

    const settings: AppSettings = {
      invoiceCounter: 1001,
      invoiceCounterYear: new Date().getFullYear(),
    };

    data?.forEach(item => {
      if (item.key === 'invoice_counter') {
        settings.invoiceCounter = (item.value as { next?: number })?.next || 1001;
      }
    });

    return settings;
  }

  async updateSettings(updates: Partial<AppSettings>): Promise<AppSettings> {
    if (updates.invoiceCounter !== undefined) {
      await supabase
        .from('sp_app_settings')
        .upsert({ 
          key: 'invoice_counter', 
          value: { next: updates.invoiceCounter } 
        }, { onConflict: 'key' });
    }

    return this.getSettings();
  }

  // ============================================
  // MAPPERS
  // ============================================

  private mapInvoice(data: Record<string, unknown>): Invoice {
    return {
      id: data.id as string,
      createdBy: data.created_by as string,
      invoiceNumber: data.invoice_number as string,
      businessArm: data.business_arm as BusinessArm | undefined,
      clientName: data.client_name as string | undefined,
      clientEmail: data.client_email as string | undefined,
      clientAddress: data.client_address as string | undefined,
      clientPhone: data.client_phone as string | undefined,
      reference: data.reference as string | undefined,
      paymentTerms: data.payment_terms as string | undefined,
      notes: data.notes as string | undefined,
      issueDate: data.issue_date as string,
      dueDate: data.due_date as string | undefined,
      status: data.status as InvoiceStatus,
      items: (data.items as InvoiceItem[]) || [],
      total: Number(data.total) || 0,
      paidDate: data.paid_date as string | undefined,
      quotationId: data.quotation_id as string | undefined,
      createdAt: data.created_at as string,
      updatedAt: data.updated_at as string,
    };
  }

  private mapQuotation(data: Record<string, unknown>): Quotation {
    return {
      id: data.id as string,
      createdBy: data.created_by as string,
      quotationNumber: data.quotation_number as string,
      businessArm: data.business_arm as BusinessArm | undefined,
      clientName: data.client_name as string | undefined,
      clientEmail: data.client_email as string | undefined,
      clientAddress: data.client_address as string | undefined,
      clientPhone: data.client_phone as string | undefined,
      reference: data.reference as string | undefined,
      notes: data.notes as string | undefined,
      issueDate: data.issue_date as string,
      validUntil: data.valid_until as string | undefined,
      status: data.status as QuotationStatus,
      items: (data.items as InvoiceItem[]) || [],
      total: Number(data.total) || 0,
      convertedInvoiceId: data.converted_invoice_id as string | undefined,
      createdAt: data.created_at as string,
      updatedAt: data.updated_at as string,
    };
  }

  private mapBill(data: Record<string, unknown>): Bill {
    return {
      id: data.id as string,
      createdBy: data.created_by as string,
      vendorName: data.vendor_name as string,
      category: data.category as string,
      amount: Number(data.amount) || 0,
      dueDate: data.due_date as string | undefined,
      status: data.status as BillStatus,
      paidDate: data.paid_date as string | undefined,
      attachmentMeta: data.attachment_file_name ? {
        fileName: data.attachment_file_name as string,
        fileSize: data.attachment_file_size as number,
        fileType: data.attachment_file_type as string,
        uploadedAt: data.attachment_uploaded_at as string,
      } : undefined,
      createdAt: data.created_at as string,
      updatedAt: data.updated_at as string,
    };
  }

  private mapPurchaseOrder(data: Record<string, unknown>): PurchaseOrder {
    return {
      id: data.id as string,
      poNumber: data.po_number as string,
      vendorName: data.vendor_name as string,
      vendorEmail: data.vendor_email as string | undefined,
      vendorAddress: data.vendor_address as string | undefined,
      items: (data.items as InvoiceItem[]) || [],
      total: Number(data.total) || 0,
      status: data.status as POStatus,
      expectedDelivery: data.expected_delivery as string | undefined,
      notes: data.notes as string | undefined,
      createdBy: data.created_by as string,
      createdAt: data.created_at as string,
      updatedAt: data.updated_at as string,
    };
  }

  private mapPayment(data: Record<string, unknown>): Payment {
    return {
      id: data.id as string,
      paymentNumber: data.payment_number as string,
      billId: data.bill_id as string | undefined,
      poId: data.po_id as string | undefined,
      vendorName: data.vendor_name as string,
      amount: Number(data.amount) || 0,
      paymentDate: data.payment_date as string,
      paymentMethod: data.payment_method as PaymentMethod,
      reference: data.reference as string | undefined,
      notes: data.notes as string | undefined,
      createdBy: data.created_by as string,
      createdAt: data.created_at as string,
    };
  }
}

export const entriesSupabaseRepo = new EntriesSupabaseRepo();
