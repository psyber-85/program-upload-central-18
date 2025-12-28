import React, { useState, useEffect } from 'react';
import { entriesSupabaseRepo } from '@/lib/dal';
import { useAuth } from '@/contexts/AuthContext';
import { Bill, PurchaseOrder, Payment } from '@/lib/dal/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Plus, Receipt, CheckCircle, Clock, Send, Loader2, Download, ShoppingCart, CreditCard, User } from 'lucide-react';
import { format } from 'date-fns';
import { generatePOPDF } from '@/lib/pdfGenerator';

const Payments = () => {
  const { user } = useAuth();
  const [bills, setBills] = useState<Bill[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('bills');
  
  // Bill dialog state
  const [showBillDialog, setShowBillDialog] = useState(false);
  const [billVendor, setBillVendor] = useState('');
  const [billCategory, setBillCategory] = useState('');
  const [billAmount, setBillAmount] = useState('');
  const [isCreatingBill, setIsCreatingBill] = useState(false);

  // PO dialog state
  const [showPODialog, setShowPODialog] = useState(false);
  const [poVendor, setPOVendor] = useState('');
  const [poDescription, setPODescription] = useState('');
  const [poAmount, setPOAmount] = useState('');
  const [isCreatingPO, setIsCreatingPO] = useState(false);

  // Payment dialog state
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentVendor, setPaymentVendor] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'Bank Transfer' | 'Cash' | 'Cheque' | 'Card'>('Bank Transfer');
  const [paymentReference, setPaymentReference] = useState('');
  const [isCreatingPayment, setIsCreatingPayment] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [allBills, allPOs, allPayments] = await Promise.all([
        entriesSupabaseRepo.getAllBills(),
        entriesSupabaseRepo.getAllPurchaseOrders(),
        entriesSupabaseRepo.getAllPayments(),
      ]);
      setBills(allBills);
      setPurchaseOrders(allPOs);
      setPayments(allPayments);
    } catch (error) {
      console.error('Failed to load payments data:', error);
    } finally {
      setIsLoading(false);
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
      await entriesSupabaseRepo.createBill({ createdBy: user.id, vendorName: billVendor, category: billCategory, amount, status: 'Draft' });
      toast({ title: 'Bill created!' });
      setShowBillDialog(false);
      setBillVendor(''); setBillCategory(''); setBillAmount('');
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
        vendorName: poVendor,
        items: [{ description: poDescription, quantity: 1, unitPrice: amount, total: amount }],
        total: amount,
        status: 'Draft',
        createdBy: user.id,
        creatorName: user.name,
      });
      toast({ title: 'Purchase Order created!' });
      setShowPODialog(false);
      setPOVendor(''); setPOAmount(''); setPODescription('');
      loadData();
    } catch (error) {
      toast({ title: 'Failed to create PO', variant: 'destructive' });
    } finally {
      setIsCreatingPO(false);
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
        vendorName: paymentVendor,
        amount,
        paymentDate: format(new Date(), 'yyyy-MM-dd'),
        paymentMethod,
        reference: paymentReference || undefined,
        createdBy: user.id,
        creatorName: user.name,
      });
      toast({ title: 'Payment recorded!' });
      setShowPaymentDialog(false);
      setPaymentVendor(''); setPaymentAmount(''); setPaymentReference('');
      loadData();
    } catch (error) {
      toast({ title: 'Failed to record payment', variant: 'destructive' });
    } finally {
      setIsCreatingPayment(false);
    }
  };

  const handleMarkBillPaid = async (id: string) => {
    await entriesSupabaseRepo.markBillPaid(id, format(new Date(), 'yyyy-MM-dd'));
    toast({ title: 'Bill marked as paid!' });
    loadData();
  };

  const handleUpdatePOStatus = async (id: string, status: 'Sent' | 'Received' | 'Closed') => {
    await entriesSupabaseRepo.updatePurchaseOrderStatus(id, status);
    toast({ title: `PO marked as ${status}!` });
    loadData();
  };

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { class: string; icon: React.ReactNode }> = {
      Paid: { class: 'text-green-600 border-green-300 bg-green-50', icon: <CheckCircle className="h-3 w-3 mr-1" /> },
      Sent: { class: 'text-blue-600 border-blue-300 bg-blue-50', icon: <Send className="h-3 w-3 mr-1" /> },
      Draft: { class: 'text-amber-600 border-amber-300 bg-amber-50', icon: <Clock className="h-3 w-3 mr-1" /> },
      Received: { class: 'text-green-600 border-green-300 bg-green-50', icon: <CheckCircle className="h-3 w-3 mr-1" /> },
      Closed: { class: 'text-gray-600 border-gray-300 bg-gray-50', icon: <CheckCircle className="h-3 w-3 mr-1" /> },
    };
    const config = configs[status] || configs.Draft;
    return <Badge variant="outline" className={config.class}>{config.icon}{status}</Badge>;
  };

  return (
    <div className="min-h-screen bg-muted/30 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Payments</h1>
          <p className="text-muted-foreground">Manage bills, purchase orders, and payments (Accounts Payable)</p>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <TabsList>
              <TabsTrigger value="bills">Bills</TabsTrigger>
              <TabsTrigger value="pos">Purchase Orders</TabsTrigger>
              <TabsTrigger value="payments">Payments</TabsTrigger>
            </TabsList>
            
            <div className="flex items-center gap-2 flex-wrap">
              {activeTab === 'bills' && (
                <Dialog open={showBillDialog} onOpenChange={setShowBillDialog}>
                  <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />New Bill</Button></DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Create Bill</DialogTitle></DialogHeader>
                    <div className="space-y-4 mt-4">
                      <div><Label>Vendor Name</Label><Input value={billVendor} onChange={(e) => setBillVendor(e.target.value)} /></div>
                      <div><Label>Category</Label>
                        <Select value={billCategory} onValueChange={setBillCategory}>
                          <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Utilities">Utilities</SelectItem>
                            <SelectItem value="Cloud Services">Cloud Services</SelectItem>
                            <SelectItem value="Office Rent">Office Rent</SelectItem>
                            <SelectItem value="Software">Software</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div><Label>Amount (RM)</Label><Input type="number" value={billAmount} onChange={(e) => setBillAmount(e.target.value)} /></div>
                      <Button onClick={handleCreateBill} className="w-full" disabled={isCreatingBill}>
                        {isCreatingBill && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Create Bill
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}

              {activeTab === 'pos' && (
                <Dialog open={showPODialog} onOpenChange={setShowPODialog}>
                  <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />New PO</Button></DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Create Purchase Order</DialogTitle></DialogHeader>
                    <div className="space-y-4 mt-4">
                      <div><Label>Vendor Name</Label><Input value={poVendor} onChange={(e) => setPOVendor(e.target.value)} /></div>
                      <div><Label>Description</Label><Input value={poDescription} onChange={(e) => setPODescription(e.target.value)} /></div>
                      <div><Label>Amount (RM)</Label><Input type="number" value={poAmount} onChange={(e) => setPOAmount(e.target.value)} /></div>
                      <Button onClick={handleCreatePO} className="w-full" disabled={isCreatingPO}>
                        {isCreatingPO && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Create PO
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}

              {activeTab === 'payments' && (
                <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
                  <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Record Payment</Button></DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Record Payment</DialogTitle></DialogHeader>
                    <div className="space-y-4 mt-4">
                      <div><Label>Vendor Name</Label><Input value={paymentVendor} onChange={(e) => setPaymentVendor(e.target.value)} /></div>
                      <div><Label>Amount (RM)</Label><Input type="number" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} /></div>
                      <div><Label>Payment Method</Label>
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
                      <div><Label>Reference (optional)</Label><Input value={paymentReference} onChange={(e) => setPaymentReference(e.target.value)} /></div>
                      <Button onClick={handleCreatePayment} className="w-full" disabled={isCreatingPayment}>
                        {isCreatingPayment && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Record Payment
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>

          {/* Bills Tab */}
          <TabsContent value="bills">
            {isLoading ? <Card><CardContent className="p-6"><Skeleton className="h-64 w-full" /></CardContent></Card> :
            bills.length === 0 ? <Card className="text-center py-12"><CardContent><Receipt className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><p className="text-muted-foreground">No bills yet</p></CardContent></Card> :
            <Card><CardContent className="p-0">
              <Table>
                <TableHeader><TableRow>
                  <TableHead>Vendor</TableHead><TableHead>Category</TableHead><TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {bills.map((bill) => (
                    <TableRow key={bill.id}>
                      <TableCell className="font-medium">{bill.vendorName}</TableCell>
                      <TableCell><Badge variant="secondary">{bill.category}</Badge></TableCell>
                      <TableCell className="text-right">RM {bill.amount.toLocaleString()}</TableCell>
                      <TableCell>{getStatusBadge(bill.status)}</TableCell>
                      <TableCell className="text-right">
                        {bill.status !== 'Paid' && <Button size="sm" variant="outline" onClick={() => handleMarkBillPaid(bill.id)}>Mark Paid</Button>}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent></Card>}
          </TabsContent>

          {/* Purchase Orders Tab */}
          <TabsContent value="pos">
            {isLoading ? <Card><CardContent className="p-6"><Skeleton className="h-64 w-full" /></CardContent></Card> :
            purchaseOrders.length === 0 ? <Card className="text-center py-12"><CardContent><ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><p className="text-muted-foreground">No purchase orders yet</p></CardContent></Card> :
            <Card><CardContent className="p-0">
              <Table>
                <TableHeader><TableRow>
                  <TableHead>PO #</TableHead><TableHead>Vendor</TableHead><TableHead>Created By</TableHead>
                  <TableHead className="text-right">Total</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {purchaseOrders.map((po) => (
                    <TableRow key={po.id}>
                      <TableCell className="font-medium">{po.poNumber}</TableCell>
                      <TableCell>{po.vendorName}</TableCell>
                      <TableCell><div className="flex items-center gap-1"><User className="h-3 w-3 text-muted-foreground" /><span className="text-sm">{po.creatorName || 'Unknown'}</span></div></TableCell>
                      <TableCell className="text-right">RM {po.total.toLocaleString()}</TableCell>
                      <TableCell>{getStatusBadge(po.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-1 justify-end flex-wrap">
                          <Button size="sm" variant="ghost" onClick={() => generatePOPDF(po)}><Download className="h-3 w-3" /></Button>
                          {po.status === 'Draft' && <Button size="sm" variant="outline" onClick={() => handleUpdatePOStatus(po.id, 'Sent')}>Send</Button>}
                          {po.status === 'Sent' && <Button size="sm" variant="outline" onClick={() => handleUpdatePOStatus(po.id, 'Received')}>Received</Button>}
                          {po.status === 'Received' && <Button size="sm" variant="outline" onClick={() => handleUpdatePOStatus(po.id, 'Closed')}>Close</Button>}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent></Card>}
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments">
            {isLoading ? <Card><CardContent className="p-6"><Skeleton className="h-64 w-full" /></CardContent></Card> :
            payments.length === 0 ? <Card className="text-center py-12"><CardContent><CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><p className="text-muted-foreground">No payments recorded yet</p></CardContent></Card> :
            <Card><CardContent className="p-0">
              <Table>
                <TableHeader><TableRow>
                  <TableHead>Payment #</TableHead><TableHead>Vendor</TableHead><TableHead>Method</TableHead>
                  <TableHead className="text-right">Amount</TableHead><TableHead>Date</TableHead><TableHead>Reference</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {payments.map((pay) => (
                    <TableRow key={pay.id}>
                      <TableCell className="font-medium">{pay.paymentNumber}</TableCell>
                      <TableCell>{pay.vendorName}</TableCell>
                      <TableCell><Badge variant="secondary">{pay.paymentMethod}</Badge></TableCell>
                      <TableCell className="text-right">RM {pay.amount.toLocaleString()}</TableCell>
                      <TableCell>{format(new Date(pay.paymentDate), 'dd MMM yyyy')}</TableCell>
                      <TableCell>{pay.reference || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent></Card>}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Payments;
