import React, { useState, useEffect } from 'react';
import { entriesLocalRepo } from '@/lib/dal/localStorage/EntriesLocalRepo';
import { useAuth } from '@/contexts/AuthContext';
import { Invoice, Bill } from '@/lib/dal/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Plus, FileText, Receipt, CheckCircle, Clock, Send, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

const Entries = () => {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('invoices');
  
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
  const [isCreatingBill, setIsCreatingBill] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [allInvoices, allBills] = await Promise.all([
        entriesLocalRepo.getAllInvoices(),
        entriesLocalRepo.getAllBills(),
      ]);
      setInvoices(allInvoices);
      setBills(allBills);
    } catch (error) {
      console.error('Failed to load entries:', error);
    } finally {
      setIsLoading(false);
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
      await entriesLocalRepo.createInvoice({
        createdBy: user.id,
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
      await entriesLocalRepo.createBill({
        createdBy: user.id,
        vendorName: billVendor,
        category: billCategory,
        amount,
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

  const handleMarkInvoicePaid = async (id: string) => {
    try {
      await entriesLocalRepo.markInvoicePaid(id, format(new Date(), 'yyyy-MM-dd'));
      toast({ title: 'Invoice marked as paid!' });
      loadData();
    } catch (error) {
      toast({ title: 'Failed to update invoice', variant: 'destructive' });
    }
  };

  const handleMarkInvoiceSent = async (id: string) => {
    try {
      await entriesLocalRepo.markInvoiceSent(id);
      toast({ title: 'Invoice marked as sent!' });
      loadData();
    } catch (error) {
      toast({ title: 'Failed to update invoice', variant: 'destructive' });
    }
  };

  const handleMarkBillPaid = async (id: string) => {
    try {
      await entriesLocalRepo.markBillPaid(id, format(new Date(), 'yyyy-MM-dd'));
      toast({ title: 'Bill marked as paid!' });
      loadData();
    } catch (error) {
      toast({ title: 'Failed to update bill', variant: 'destructive' });
    }
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

  return (
    <div className="min-h-screen bg-muted/30 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Entries</h1>
          <p className="text-muted-foreground">Manage invoices and bills</p>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="invoices">Invoices</TabsTrigger>
              <TabsTrigger value="bills">Bills</TabsTrigger>
            </TabsList>
            {activeTab === 'invoices' ? (
              <Dialog open={showInvoiceDialog} onOpenChange={setShowInvoiceDialog}>
                <DialogTrigger asChild>
                  <Button><Plus className="h-4 w-4 mr-2" />New Invoice</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Invoice</DialogTitle>
                    <DialogDescription>Add a new invoice entry</DialogDescription>
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
            ) : (
              <Dialog open={showBillDialog} onOpenChange={setShowBillDialog}>
                <DialogTrigger asChild>
                  <Button><Plus className="h-4 w-4 mr-2" />New Bill</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Bill</DialogTitle>
                    <DialogDescription>Add a new bill entry</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label>Vendor Name</Label>
                      <Input value={billVendor} onChange={(e) => setBillVendor(e.target.value)} placeholder="AWS" />
                    </div>
                    <div className="space-y-2">
                      <Label>Category</Label>
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
                    <div className="space-y-2">
                      <Label>Amount (RM)</Label>
                      <Input type="number" value={billAmount} onChange={(e) => setBillAmount(e.target.value)} placeholder="0.00" />
                    </div>
                    <Button onClick={handleCreateBill} className="w-full" disabled={isCreatingBill}>
                      {isCreatingBill && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      Create Bill
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>

          <TabsContent value="invoices">
            {isLoading ? (
              <Card><CardContent className="p-6"><Skeleton className="h-64 w-full" /></CardContent></Card>
            ) : invoices.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No invoices yet</p>
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
                            <div className="flex gap-1 justify-end">
                              {invoice.status === 'Draft' && (
                                <Button size="sm" variant="outline" onClick={() => handleMarkInvoiceSent(invoice.id)}>
                                  <Send className="h-3 w-3 mr-1" />
                                  Send
                                </Button>
                              )}
                              {invoice.status !== 'Paid' && (
                                <Button size="sm" variant="outline" onClick={() => handleMarkInvoicePaid(invoice.id)}>
                                  Mark Paid
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

          <TabsContent value="bills">
            {isLoading ? (
              <Card><CardContent className="p-6"><Skeleton className="h-64 w-full" /></CardContent></Card>
            ) : bills.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Receipt className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No bills yet</p>
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
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bills.map((bill) => (
                        <TableRow key={bill.id}>
                          <TableCell className="font-medium">{bill.vendorName}</TableCell>
                          <TableCell><Badge variant="secondary">{bill.category}</Badge></TableCell>
                          <TableCell className="text-right">RM {bill.amount.toLocaleString()}</TableCell>
                          <TableCell>{getInvoiceStatusBadge(bill.status)}</TableCell>
                          <TableCell className="text-right">
                            {bill.status !== 'Paid' && (
                              <Button size="sm" variant="outline" onClick={() => handleMarkBillPaid(bill.id)}>
                                Mark Paid
                              </Button>
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
        </Tabs>
      </div>
    </div>
  );
};

export default Entries;
