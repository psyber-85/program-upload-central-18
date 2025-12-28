import React, { useState, useEffect } from 'react';
import { entriesSupabaseRepo } from '@/lib/dal';
import { useAuth } from '@/contexts/AuthContext';
import { Invoice, Quotation } from '@/lib/dal/types';
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
import { Plus, FileText, CheckCircle, Clock, Send, Loader2, ArrowRight, XCircle, FileCheck, Download } from 'lucide-react';
import { generateInvoicePDF, generateQuotationPDF } from '@/lib/pdfGenerator';
import { format } from 'date-fns';

const MyEntries = () => {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
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

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const [allInvoices, allQuotations] = await Promise.all([
        entriesSupabaseRepo.getAllInvoices(),
        entriesSupabaseRepo.getAllQuotations(),
      ]);
      // Filter to only show user's own entries
      setInvoices(allInvoices.filter(inv => inv.createdBy === user.id));
      setQuotations(allQuotations.filter(q => q.createdBy === user.id));
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

  return (
    <div className="min-h-screen bg-muted/30 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">My Entries</h1>
          <p className="text-muted-foreground">Create and manage your quotations and invoices</p>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <TabsList>
              <TabsTrigger value="quotations">Quotations</TabsTrigger>
              <TabsTrigger value="invoices">Invoices</TabsTrigger>
            </TabsList>
            
            <div className="flex gap-2">
              {activeTab === 'quotations' ? (
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
              ) : (
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
              )}
            </div>
          </div>

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

          <TabsContent value="invoices">
            {isLoading ? (
              <Card><CardContent className="p-6"><Skeleton className="h-64 w-full" /></CardContent></Card>
            ) : invoices.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
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
                            <div className="flex gap-1 justify-end">
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
        </Tabs>
      </div>
    </div>
  );
};

export default MyEntries;