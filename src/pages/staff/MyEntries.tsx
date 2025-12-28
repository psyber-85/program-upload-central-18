import React, { useState, useEffect } from 'react';
import { entriesSupabaseRepo } from '@/lib/dal';
import { useAuth } from '@/contexts/AuthContext';
import { Invoice, Quotation, Bill, PurchaseOrder, Payment } from '@/lib/dal/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Plus, FileText, CheckCircle, Clock, Send, Loader2, ArrowRight, XCircle, FileCheck, Download, Package, Receipt, CreditCard, AlertCircle } from 'lucide-react';
import { generateInvoicePDF, generateQuotationPDF } from '@/lib/pdfGenerator';
import { format } from 'date-fns';

const MyEntries = () => {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('quotations');
  
  // Quotation dialog state
  const [showQuotationDialog, setShowQuotationDialog] = useState(false);
  const [quotationClient, setQuotationClient] = useState('');
  const [quotationBusinessArm, setQuotationBusinessArm] = useState<'Training' | 'Solutions'>('Training');
  const [quotationAmount, setQuotationAmount] = useState('');
  const [quotationDescription, setQuotationDescription] = useState('');
  const [isCreatingQuotation, setIsCreatingQuotation] = useState(false);
  
  // Invoice dialog state
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false);
  const [invoiceClient, setInvoiceClient] = useState('');
  const [invoiceBusinessArm, setInvoiceBusinessArm] = useState<'Training' | 'Solutions'>('Training');
  const [invoiceAmount, setInvoiceAmount] = useState('');
  const [invoiceDescription, setInvoiceDescription] = useState('');
  const [isCreatingInvoice, setIsCreatingInvoice] = useState(false);

  // Bill dialog state
  const [showBillDialog, setShowBillDialog] = useState(false);
  const [billVendor, setBillVendor] = useState('');
  const [billCategory, setBillCategory] = useState('');
  const [billAmount, setBillAmount] = useState('');
  const [billDueDate, setBillDueDate] = useState('');
  const [isCreatingBill, setIsCreatingBill] = useState(false);

  // PO dialog state
  const [showPODialog, setShowPODialog] = useState(false);
  const [poVendor, setPOVendor] = useState('');
  const [poAmount, setPOAmount] = useState('');
  const [poDescription, setPODescription] = useState('');
  const [poExpectedDelivery, setPOExpectedDelivery] = useState('');
  const [isCreatingPO, setIsCreatingPO] = useState(false);
  const [isSubmittingPO, setIsSubmittingPO] = useState<string | null>(null);

  // Payment dialog state
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentVendor, setPaymentVendor] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'Bank Transfer' | 'Cash' | 'Cheque' | 'Card'>('Bank Transfer');
  const [paymentReference, setPaymentReference] = useState('');
  const [isCreatingPayment, setIsCreatingPayment] = useState(false);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const [allInvoices, allQuotations, allBills, allPOs, allPayments] = await Promise.all([
        entriesSupabaseRepo.getAllInvoices(),
        entriesSupabaseRepo.getAllQuotations(),
        entriesSupabaseRepo.getAllBills(),
        entriesSupabaseRepo.getAllPurchaseOrders(),
        entriesSupabaseRepo.getAllPayments(),
      ]);
      // Filter to only show user's own entries
      setInvoices(allInvoices.filter(inv => inv.createdBy === user.id));
      setQuotations(allQuotations.filter(q => q.createdBy === user.id));
      setBills(allBills.filter(b => b.createdBy === user.id));
      setPurchaseOrders(allPOs.filter(po => po.createdBy === user.id));
      setPayments(allPayments.filter(p => p.createdBy === user.id));
    } catch (error) {
      console.error('Failed to load entries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateQuotation = async () => {
    if (!user || !quotationClient || !quotationAmount || !quotationDescription) {
      toast({ title: 'Please fill all required fields', variant: 'destructive' });
      return;
    }
    
    const amount = parseFloat(quotationAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({ title: 'Please enter a valid amount', variant: 'destructive' });
      return;
    }

    setIsCreatingQuotation(true);
    try {
      await entriesSupabaseRepo.createQuotation({
        createdBy: user.id,
        creatorName: user.name,
        businessArm: quotationBusinessArm,
        clientName: quotationClient,
        issueDate: format(new Date(), 'yyyy-MM-dd'),
        validUntil: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
        status: 'Draft',
        items: [{ description: quotationDescription, quantity: 1, unitPrice: amount, total: amount }],
        total: amount,
      });
      toast({ title: 'Quotation created!' });
      setShowQuotationDialog(false);
      resetQuotationForm();
      loadData();
    } catch (error) {
      toast({ title: 'Failed to create quotation', variant: 'destructive' });
    } finally {
      setIsCreatingQuotation(false);
    }
  };

  const handleCreateInvoice = async () => {
    if (!user || !invoiceClient || !invoiceAmount || !invoiceDescription) {
      toast({ title: 'Please fill all required fields', variant: 'destructive' });
      return;
    }
    
    const amount = parseFloat(invoiceAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({ title: 'Please enter a valid amount', variant: 'destructive' });
      return;
    }

    setIsCreatingInvoice(true);
    try {
      await entriesSupabaseRepo.createInvoice({
        createdBy: user.id,
        creatorName: user.name,
        businessArm: invoiceBusinessArm,
        clientName: invoiceClient,
        issueDate: format(new Date(), 'yyyy-MM-dd'),
        status: 'Draft',
        items: [{ description: invoiceDescription, quantity: 1, unitPrice: amount, total: amount }],
        total: amount,
      });
      toast({ title: 'Invoice created!' });
      setShowInvoiceDialog(false);
      resetInvoiceForm();
      loadData();
    } catch (error) {
      toast({ title: 'Failed to create invoice', variant: 'destructive' });
    } finally {
      setIsCreatingInvoice(false);
    }
  };

  const handleCreateBill = async () => {
    if (!user || !billVendor || !billCategory || !billAmount) {
      toast({ title: 'Please fill all required fields', variant: 'destructive' });
      return;
    }
    
    const amount = parseFloat(billAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({ title: 'Please enter a valid amount', variant: 'destructive' });
      return;
    }

    setIsCreatingBill(true);
    try {
      await entriesSupabaseRepo.createBill({
        createdBy: user.id,
        vendorName: billVendor,
        category: billCategory,
        amount,
        dueDate: billDueDate || undefined,
        status: 'Draft',
      });
      toast({ title: 'Bill created!' });
      setShowBillDialog(false);
      resetBillForm();
      loadData();
    } catch (error) {
      toast({ title: 'Failed to create bill', variant: 'destructive' });
    } finally {
      setIsCreatingBill(false);
    }
  };

  const handleCreatePO = async () => {
    if (!user || !poVendor || !poAmount || !poDescription) {
      toast({ title: 'Please fill all required fields', variant: 'destructive' });
      return;
    }
    
    const amount = parseFloat(poAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({ title: 'Please enter a valid amount', variant: 'destructive' });
      return;
    }

    setIsCreatingPO(true);
    try {
      await entriesSupabaseRepo.createPurchaseOrder({
        createdBy: user.id,
        creatorName: user.name,
        vendorName: poVendor,
        items: [{ description: poDescription, quantity: 1, unitPrice: amount, total: amount }],
        total: amount,
        status: 'Draft',
        expectedDelivery: poExpectedDelivery || undefined,
      });
      toast({ title: 'Purchase Order saved as draft!' });
      setShowPODialog(false);
      resetPOForm();
      loadData();
    } catch (error) {
      toast({ title: 'Failed to create PO', variant: 'destructive' });
    } finally {
      setIsCreatingPO(false);
    }
  };

  const handleSubmitPOForApproval = async (id: string) => {
    setIsSubmittingPO(id);
    try {
      // Update PO status to 'Pending Approval'
      await entriesSupabaseRepo.updatePurchaseOrderStatus(id, 'Pending Approval' as any);
      toast({ title: 'PO submitted for admin approval!' });
      loadData();
    } catch (error) {
      toast({ title: 'Failed to submit PO', variant: 'destructive' });
    } finally {
      setIsSubmittingPO(null);
    }
  };

  const handleCreatePayment = async () => {
    if (!user || !paymentVendor || !paymentAmount) {
      toast({ title: 'Please fill all required fields', variant: 'destructive' });
      return;
    }
    
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({ title: 'Please enter a valid amount', variant: 'destructive' });
      return;
    }

    setIsCreatingPayment(true);
    try {
      await entriesSupabaseRepo.createPayment({
        createdBy: user.id,
        creatorName: user.name,
        vendorName: paymentVendor,
        amount,
        paymentDate: format(new Date(), 'yyyy-MM-dd'),
        paymentMethod,
        reference: paymentReference || undefined,
        status: 'Pending', // Staff creates payment requests as Pending
      });
      toast({ title: 'Payment request submitted! Awaiting admin approval.' });
      setShowPaymentDialog(false);
      resetPaymentForm();
      loadData();
    } catch (error) {
      toast({ title: 'Failed to request payment', variant: 'destructive' });
    } finally {
      setIsCreatingPayment(false);
    }
  };

  const handleMarkQuotationSent = async (id: string) => {
    try {
      await entriesSupabaseRepo.updateQuotationStatus(id, 'Sent');
      toast({ title: 'Quotation marked as sent!' });
      loadData();
    } catch (error) {
      toast({ title: 'Failed to update quotation', variant: 'destructive' });
    }
  };

  const handleConvertToInvoice = async (quotationId: string) => {
    try {
      const invoice = await entriesSupabaseRepo.convertQuotationToInvoice(quotationId);
      if (invoice) {
        toast({ title: 'Quotation converted to invoice!' });
        setActiveTab('invoices');
        loadData();
      } else {
        toast({ title: 'Failed to convert quotation', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Failed to convert quotation', variant: 'destructive' });
    }
  };

  const handleMarkInvoiceSent = async (id: string) => {
    try {
      await entriesSupabaseRepo.markInvoiceSent(id);
      toast({ title: 'Invoice marked as sent!' });
      loadData();
    } catch (error) {
      toast({ title: 'Failed to update invoice', variant: 'destructive' });
    }
  };

  const resetQuotationForm = () => {
    setQuotationClient('');
    setQuotationBusinessArm('Training');
    setQuotationAmount('');
    setQuotationDescription('');
  };

  const resetInvoiceForm = () => {
    setInvoiceClient('');
    setInvoiceBusinessArm('Training');
    setInvoiceAmount('');
    setInvoiceDescription('');
  };

  const resetBillForm = () => {
    setBillVendor('');
    setBillCategory('');
    setBillAmount('');
    setBillDueDate('');
  };

  const resetPOForm = () => {
    setPOVendor('');
    setPOAmount('');
    setPODescription('');
    setPOExpectedDelivery('');
  };

  const resetPaymentForm = () => {
    setPaymentVendor('');
    setPaymentAmount('');
    setPaymentMethod('Bank Transfer');
    setPaymentReference('');
  };

  const getQuotationStatusBadge = (status: string) => {
    switch (status) {
      case 'Accepted':
        return <Badge variant="outline" className="text-green-600 border-green-300 bg-green-50"><CheckCircle className="h-3 w-3 mr-1" />Accepted</Badge>;
      case 'Converted':
        return <Badge variant="outline" className="text-purple-600 border-purple-300 bg-purple-50"><FileCheck className="h-3 w-3 mr-1" />Converted</Badge>;
      case 'Sent':
        return <Badge variant="outline" className="text-blue-600 border-blue-300 bg-blue-50"><Send className="h-3 w-3 mr-1" />Sent</Badge>;
      case 'Rejected':
        return <Badge variant="outline" className="text-red-600 border-red-300 bg-red-50"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50"><Clock className="h-3 w-3 mr-1" />Draft</Badge>;
    }
  };

  const getInvoiceStatusBadge = (status: string) => {
    switch (status) {
      case 'Paid':
        return <Badge variant="outline" className="text-green-600 border-green-300 bg-green-50"><CheckCircle className="h-3 w-3 mr-1" />Paid</Badge>;
      case 'Sent':
        return <Badge variant="outline" className="text-blue-600 border-blue-300 bg-blue-50"><Send className="h-3 w-3 mr-1" />Sent</Badge>;
      default:
        return <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50"><Clock className="h-3 w-3 mr-1" />Draft</Badge>;
    }
  };

  const getBillStatusBadge = (status: string) => {
    switch (status) {
      case 'Paid':
        return <Badge variant="outline" className="text-green-600 border-green-300 bg-green-50"><CheckCircle className="h-3 w-3 mr-1" />Paid</Badge>;
      default:
        return <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50"><Clock className="h-3 w-3 mr-1" />Draft</Badge>;
    }
  };

  const getPOStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending Approval':
        return <Badge variant="outline" className="text-orange-600 border-orange-300 bg-orange-50"><AlertCircle className="h-3 w-3 mr-1" />Pending Approval</Badge>;
      case 'Sent':
        return <Badge variant="outline" className="text-blue-600 border-blue-300 bg-blue-50"><Send className="h-3 w-3 mr-1" />Sent</Badge>;
      case 'Received':
        return <Badge variant="outline" className="text-green-600 border-green-300 bg-green-50"><CheckCircle className="h-3 w-3 mr-1" />Received</Badge>;
      case 'Closed':
        return <Badge variant="outline" className="text-gray-600 border-gray-300 bg-gray-50"><FileCheck className="h-3 w-3 mr-1" />Closed</Badge>;
      default:
        return <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50"><Clock className="h-3 w-3 mr-1" />Draft</Badge>;
    }
  };

  const getPaymentStatusBadge = (status?: string) => {
    switch (status) {
      case 'Completed':
        return <Badge variant="outline" className="text-green-600 border-green-300 bg-green-50"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>;
      case 'Pending':
        return <Badge variant="outline" className="text-orange-600 border-orange-300 bg-orange-50"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      default:
        // Legacy payments without status - show as completed
        return <Badge variant="outline" className="text-green-600 border-green-300 bg-green-50"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>;
    }
  };

  const renderCreateButton = () => {
    switch (activeTab) {
      case 'quotations':
        return (
          <Dialog open={showQuotationDialog} onOpenChange={setShowQuotationDialog}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />New Quotation</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Quotation</DialogTitle>
                <DialogDescription>Create a new quotation for a potential client</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Client Name</Label>
                  <Input value={quotationClient} onChange={(e) => setQuotationClient(e.target.value)} placeholder="ABC Corp" />
                </div>
                <div className="space-y-2">
                  <Label>Business Arm</Label>
                  <Select value={quotationBusinessArm} onValueChange={(v) => setQuotationBusinessArm(v as any)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Training">Training</SelectItem>
                      <SelectItem value="Solutions">Solutions</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Amount (RM)</Label>
                  <Input type="number" value={quotationAmount} onChange={(e) => setQuotationAmount(e.target.value)} placeholder="0.00" />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input value={quotationDescription} onChange={(e) => setQuotationDescription(e.target.value)} placeholder="Service description" />
                </div>
                <Button onClick={handleCreateQuotation} className="w-full" disabled={isCreatingQuotation}>
                  {isCreatingQuotation && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Create Quotation
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        );
      case 'invoices':
        return (
          <Dialog open={showInvoiceDialog} onOpenChange={setShowInvoiceDialog}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />New Invoice</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Invoice</DialogTitle>
                <DialogDescription>Create a new invoice directly</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Client Name</Label>
                  <Input value={invoiceClient} onChange={(e) => setInvoiceClient(e.target.value)} placeholder="ABC Corp" />
                </div>
                <div className="space-y-2">
                  <Label>Business Arm</Label>
                  <Select value={invoiceBusinessArm} onValueChange={(v) => setInvoiceBusinessArm(v as any)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Training">Training</SelectItem>
                      <SelectItem value="Solutions">Solutions</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Amount (RM)</Label>
                  <Input type="number" value={invoiceAmount} onChange={(e) => setInvoiceAmount(e.target.value)} placeholder="0.00" />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input value={invoiceDescription} onChange={(e) => setInvoiceDescription(e.target.value)} placeholder="Service description" />
                </div>
                <Button onClick={handleCreateInvoice} className="w-full" disabled={isCreatingInvoice}>
                  {isCreatingInvoice && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Create Invoice
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        );
      case 'bills':
        return (
          <Dialog open={showBillDialog} onOpenChange={setShowBillDialog}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />New Bill</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Bill</DialogTitle>
                <DialogDescription>Record a bill from a vendor</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Vendor Name</Label>
                  <Input value={billVendor} onChange={(e) => setBillVendor(e.target.value)} placeholder="Vendor ABC" />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={billCategory} onValueChange={setBillCategory}>
                    <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Office Supplies">Office Supplies</SelectItem>
                      <SelectItem value="Software">Software</SelectItem>
                      <SelectItem value="Equipment">Equipment</SelectItem>
                      <SelectItem value="Services">Services</SelectItem>
                      <SelectItem value="Utilities">Utilities</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Amount (RM)</Label>
                  <Input type="number" value={billAmount} onChange={(e) => setBillAmount(e.target.value)} placeholder="0.00" />
                </div>
                <div className="space-y-2">
                  <Label>Due Date (Optional)</Label>
                  <Input type="date" value={billDueDate} onChange={(e) => setBillDueDate(e.target.value)} />
                </div>
                <Button onClick={handleCreateBill} className="w-full" disabled={isCreatingBill}>
                  {isCreatingBill && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Create Bill
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        );
      case 'purchase-orders':
        return (
          <Dialog open={showPODialog} onOpenChange={setShowPODialog}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />New PO</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Purchase Order</DialogTitle>
                <DialogDescription>Create a new PO (requires admin approval to send)</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Vendor Name</Label>
                  <Input value={poVendor} onChange={(e) => setPOVendor(e.target.value)} placeholder="Vendor ABC" />
                </div>
                <div className="space-y-2">
                  <Label>Amount (RM)</Label>
                  <Input type="number" value={poAmount} onChange={(e) => setPOAmount(e.target.value)} placeholder="0.00" />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input value={poDescription} onChange={(e) => setPODescription(e.target.value)} placeholder="What are you ordering?" />
                </div>
                <div className="space-y-2">
                  <Label>Expected Delivery (Optional)</Label>
                  <Input type="date" value={poExpectedDelivery} onChange={(e) => setPOExpectedDelivery(e.target.value)} />
                </div>
                <Button onClick={handleCreatePO} className="w-full" disabled={isCreatingPO}>
                  {isCreatingPO && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Save as Draft
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        );
      case 'payments':
        return (
          <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />Request Payment</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Request Payment</DialogTitle>
                <DialogDescription>Submit a payment request (admin will mark as paid)</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Vendor Name</Label>
                  <Input value={paymentVendor} onChange={(e) => setPaymentVendor(e.target.value)} placeholder="Vendor ABC" />
                </div>
                <div className="space-y-2">
                  <Label>Amount (RM)</Label>
                  <Input type="number" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} placeholder="0.00" />
                </div>
                <div className="space-y-2">
                  <Label>Payment Method</Label>
                  <Select value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as any)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                      <SelectItem value="Cash">Cash</SelectItem>
                      <SelectItem value="Cheque">Cheque</SelectItem>
                      <SelectItem value="Card">Card</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Reference (Optional)</Label>
                  <Input value={paymentReference} onChange={(e) => setPaymentReference(e.target.value)} placeholder="Transaction ref" />
                </div>
                <Button onClick={handleCreatePayment} className="w-full" disabled={isCreatingPayment}>
                  {isCreatingPayment && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Submit Payment Request
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">My Billing & Payments</h1>
          <p className="text-muted-foreground">Create and manage your AR (receivables) and AP (payables)</p>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <TabsList className="flex-wrap h-auto">
              <TabsTrigger value="quotations" className="gap-1">
                <FileText className="h-4 w-4" />
                Quotations
              </TabsTrigger>
              <TabsTrigger value="invoices" className="gap-1">
                <Receipt className="h-4 w-4" />
                Invoices
              </TabsTrigger>
              <TabsTrigger value="bills" className="gap-1">
                <CreditCard className="h-4 w-4" />
                Bills
              </TabsTrigger>
              <TabsTrigger value="purchase-orders" className="gap-1">
                <Package className="h-4 w-4" />
                POs
              </TabsTrigger>
              <TabsTrigger value="payments" className="gap-1">
                <CreditCard className="h-4 w-4" />
                Payments
              </TabsTrigger>
            </TabsList>
            
            <div className="flex gap-2">
              {renderCreateButton()}
            </div>
          </div>

          {/* Quotations Tab */}
          <TabsContent value="quotations">
            {isLoading ? (
              <Card><CardContent className="p-6"><Skeleton className="h-64 w-full" /></CardContent></Card>
            ) : quotations.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">You haven't created any quotations yet</p>
                  <Button onClick={() => setShowQuotationDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Quotation
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Quotation #</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead>Business Arm</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {quotations.map((quotation) => (
                        <TableRow key={quotation.id}>
                          <TableCell className="font-medium">{quotation.quotationNumber}</TableCell>
                          <TableCell>{quotation.clientName || '-'}</TableCell>
                          <TableCell><Badge variant="secondary">{quotation.businessArm}</Badge></TableCell>
                          <TableCell className="text-right">RM {quotation.total.toLocaleString()}</TableCell>
                          <TableCell>{getQuotationStatusBadge(quotation.status)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-1 justify-end flex-wrap">
                              <Button size="sm" variant="ghost" onClick={() => generateQuotationPDF(quotation)}>
                                <Download className="h-3 w-3 mr-1" />
                                PDF
                              </Button>
                              {quotation.status === 'Draft' && (
                                <Button size="sm" variant="outline" onClick={() => handleMarkQuotationSent(quotation.id)}>
                                  <Send className="h-3 w-3 mr-1" />
                                  Send
                                </Button>
                              )}
                              {(quotation.status === 'Sent' || quotation.status === 'Accepted') && (
                                <Button size="sm" variant="default" onClick={() => handleConvertToInvoice(quotation.id)}>
                                  <ArrowRight className="h-3 w-3 mr-1" />
                                  Convert to Invoice
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Invoices Tab */}
          <TabsContent value="invoices">
            {isLoading ? (
              <Card><CardContent className="p-6"><Skeleton className="h-64 w-full" /></CardContent></Card>
            ) : invoices.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Receipt className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">You haven't created any invoices yet</p>
                  <Button onClick={() => setShowInvoiceDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Invoice
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice #</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead>Business Arm</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invoices.map((invoice) => (
                        <TableRow key={invoice.id}>
                          <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                          <TableCell>{invoice.clientName || '-'}</TableCell>
                          <TableCell><Badge variant="secondary">{invoice.businessArm}</Badge></TableCell>
                          <TableCell className="text-right">RM {invoice.total.toLocaleString()}</TableCell>
                          <TableCell>{getInvoiceStatusBadge(invoice.status)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-1 justify-end flex-wrap">
                              <Button size="sm" variant="ghost" onClick={() => generateInvoicePDF(invoice)}>
                                <Download className="h-3 w-3 mr-1" />
                                PDF
                              </Button>
                              {invoice.status === 'Draft' && (
                                <Button size="sm" variant="outline" onClick={() => handleMarkInvoiceSent(invoice.id)}>
                                  <Send className="h-3 w-3 mr-1" />
                                  Send
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Bills Tab */}
          <TabsContent value="bills">
            {isLoading ? (
              <Card><CardContent className="p-6"><Skeleton className="h-64 w-full" /></CardContent></Card>
            ) : bills.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">You haven't created any bills yet</p>
                  <Button onClick={() => setShowBillDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Bill
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Vendor</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bills.map((bill) => (
                        <TableRow key={bill.id}>
                          <TableCell className="font-medium">{bill.vendorName}</TableCell>
                          <TableCell><Badge variant="secondary">{bill.category}</Badge></TableCell>
                          <TableCell className="text-right">RM {bill.amount.toLocaleString()}</TableCell>
                          <TableCell>{bill.dueDate ? format(new Date(bill.dueDate), 'dd MMM yyyy') : '-'}</TableCell>
                          <TableCell>{getBillStatusBadge(bill.status)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Purchase Orders Tab */}
          <TabsContent value="purchase-orders">
            {isLoading ? (
              <Card><CardContent className="p-6"><Skeleton className="h-64 w-full" /></CardContent></Card>
            ) : purchaseOrders.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">You haven't created any purchase orders yet</p>
                  <Button onClick={() => setShowPODialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First PO
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>PO #</TableHead>
                        <TableHead>Vendor</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead>Expected Delivery</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {purchaseOrders.map((po) => (
                        <TableRow key={po.id}>
                          <TableCell className="font-medium">{po.poNumber}</TableCell>
                          <TableCell>{po.vendorName}</TableCell>
                          <TableCell className="text-right">RM {po.total.toLocaleString()}</TableCell>
                          <TableCell>{po.expectedDelivery ? format(new Date(po.expectedDelivery), 'dd MMM yyyy') : '-'}</TableCell>
                          <TableCell>{getPOStatusBadge(po.status)}</TableCell>
                          <TableCell className="text-right">
                            {po.status === 'Draft' && (
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => handleSubmitPOForApproval(po.id)}
                                disabled={isSubmittingPO === po.id}
                              >
                                {isSubmittingPO === po.id && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
                                <Send className="h-3 w-3 mr-1" />
                                Submit for Approval
                              </Button>
                            )}
                            {po.status === 'Pending Approval' && (
                              <span className="text-sm text-muted-foreground">Awaiting admin</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments">
            {isLoading ? (
              <Card><CardContent className="p-6"><Skeleton className="h-64 w-full" /></CardContent></Card>
            ) : payments.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">You haven't requested any payments yet</p>
                  <Button onClick={() => setShowPaymentDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Request Your First Payment
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Payment #</TableHead>
                        <TableHead>Vendor</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Reference</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell className="font-medium">{payment.paymentNumber}</TableCell>
                          <TableCell>{payment.vendorName}</TableCell>
                          <TableCell className="text-right">RM {payment.amount.toLocaleString()}</TableCell>
                          <TableCell><Badge variant="secondary">{payment.paymentMethod}</Badge></TableCell>
                          <TableCell>{format(new Date(payment.paymentDate), 'dd MMM yyyy')}</TableCell>
                          <TableCell>{getPaymentStatusBadge(payment.status)}</TableCell>
                          <TableCell>{payment.reference || '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MyEntries;
