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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Plus, FileText, CheckCircle, Clock, Send, Loader2, Download, User } from 'lucide-react';
import { format } from 'date-fns';
import { generateInvoicePDF, generateQuotationPDF } from '@/lib/pdfGenerator';

const Billing = () => {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('invoices');
  const [creatorFilter, setCreatorFilter] = useState<string>('all');
  
  // Invoice dialog state
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false);
  const [invoiceClient, setInvoiceClient] = useState('');
  const [invoiceAmount, setInvoiceAmount] = useState('');
  const [invoiceDescription, setInvoiceDescription] = useState('');
  const [isCreatingInvoice, setIsCreatingInvoice] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [allInvoices, allQuotations] = await Promise.all([
        entriesSupabaseRepo.getAllInvoices(),
        entriesSupabaseRepo.getAllQuotations(),
      ]);
      setInvoices(allInvoices);
      setQuotations(allQuotations);
    } catch (error) {
      console.error('Failed to load billing data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const uniqueCreators = React.useMemo(() => {
    const creators = new Map<string, string>();
    invoices.forEach(inv => { if (inv.creatorName) creators.set(inv.createdBy, inv.creatorName); });
    quotations.forEach(q => { if (q.creatorName) creators.set(q.createdBy, q.creatorName); });
    return Array.from(creators.entries()).map(([id, name]) => ({ id, name }));
  }, [invoices, quotations]);

  const filteredInvoices = creatorFilter === 'all' ? invoices : invoices.filter(inv => inv.createdBy === creatorFilter);
  const filteredQuotations = creatorFilter === 'all' ? quotations : quotations.filter(q => q.createdBy === creatorFilter);

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
        clientName: invoiceClient,
        issueDate: format(new Date(), 'yyyy-MM-dd'),
        status: 'Draft',
        items: [{ description: invoiceDescription, quantity: 1, unitPrice: amount, total: amount }],
        total: amount,
      });
      toast({ title: 'Invoice created!' });
      setShowInvoiceDialog(false);
      setInvoiceClient(''); setInvoiceAmount(''); setInvoiceDescription('');
      loadData();
    } catch (error) {
      toast({ title: 'Failed to create invoice', variant: 'destructive' });
    } finally {
      setIsCreatingInvoice(false);
    }
  };

  const handleMarkInvoicePaid = async (id: string) => {
    await entriesSupabaseRepo.markInvoicePaid(id, format(new Date(), 'yyyy-MM-dd'));
    toast({ title: 'Invoice marked as paid!' });
    loadData();
  };

  const handleMarkInvoiceSent = async (id: string) => {
    await entriesSupabaseRepo.markInvoiceSent(id);
    toast({ title: 'Invoice marked as sent!' });
    loadData();
  };

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { class: string; icon: React.ReactNode }> = {
      Paid: { class: 'text-green-600 border-green-300 bg-green-50', icon: <CheckCircle className="h-3 w-3 mr-1" /> },
      Sent: { class: 'text-blue-600 border-blue-300 bg-blue-50', icon: <Send className="h-3 w-3 mr-1" /> },
      Draft: { class: 'text-amber-600 border-amber-300 bg-amber-50', icon: <Clock className="h-3 w-3 mr-1" /> },
      Accepted: { class: 'text-green-600 border-green-300 bg-green-50', icon: <CheckCircle className="h-3 w-3 mr-1" /> },
      Converted: { class: 'text-purple-600 border-purple-300 bg-purple-50', icon: <CheckCircle className="h-3 w-3 mr-1" /> },
      Rejected: { class: 'text-red-600 border-red-300 bg-red-50', icon: <CheckCircle className="h-3 w-3 mr-1" /> },
    };
    const config = configs[status] || configs.Draft;
    return <Badge variant="outline" className={config.class}>{config.icon}{status}</Badge>;
  };

  return (
    <div className="min-h-screen bg-muted/30 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Billing</h1>
          <p className="text-muted-foreground">Manage invoices and quotations (Accounts Receivable)</p>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <TabsList>
              <TabsTrigger value="invoices">Invoices</TabsTrigger>
              <TabsTrigger value="quotations">Quotations</TabsTrigger>
            </TabsList>
            
            <div className="flex items-center gap-2 flex-wrap">
              {uniqueCreators.length > 0 && (
                <Select value={creatorFilter} onValueChange={setCreatorFilter}>
                  <SelectTrigger className="w-[180px]">
                    <User className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by creator" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Creators</SelectItem>
                    {uniqueCreators.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
              
              {activeTab === 'invoices' && (
                <Dialog open={showInvoiceDialog} onOpenChange={setShowInvoiceDialog}>
                  <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />New Invoice</Button></DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Create Invoice</DialogTitle></DialogHeader>
                    <div className="space-y-4 mt-4">
                      <div><Label>Client Name</Label><Input value={invoiceClient} onChange={(e) => setInvoiceClient(e.target.value)} /></div>
                      <div><Label>Amount (RM)</Label><Input type="number" value={invoiceAmount} onChange={(e) => setInvoiceAmount(e.target.value)} /></div>
                      <div><Label>Description</Label><Input value={invoiceDescription} onChange={(e) => setInvoiceDescription(e.target.value)} /></div>
                      <Button onClick={handleCreateInvoice} className="w-full" disabled={isCreatingInvoice}>
                        {isCreatingInvoice && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Create Invoice
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>

          {/* Invoices Tab */}
          <TabsContent value="invoices">
            {isLoading ? <Card><CardContent className="p-6"><Skeleton className="h-64 w-full" /></CardContent></Card> :
            filteredInvoices.length === 0 ? <Card className="text-center py-12"><CardContent><FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><p className="text-muted-foreground">No invoices yet</p></CardContent></Card> :
            <Card><CardContent className="p-0">
              <Table>
                <TableHeader><TableRow>
                  <TableHead>Invoice #</TableHead><TableHead>Client</TableHead><TableHead>Created By</TableHead>
                  <TableHead className="text-right">Total</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {filteredInvoices.map((inv) => (
                    <TableRow key={inv.id}>
                      <TableCell className="font-medium">{inv.invoiceNumber}</TableCell>
                      <TableCell>{inv.clientName || '-'}</TableCell>
                      <TableCell><div className="flex items-center gap-1"><User className="h-3 w-3 text-muted-foreground" /><span className="text-sm">{inv.creatorName || 'Unknown'}</span></div></TableCell>
                      <TableCell className="text-right">RM {inv.total.toLocaleString()}</TableCell>
                      <TableCell>{getStatusBadge(inv.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-1 justify-end flex-wrap">
                          <Button size="sm" variant="ghost" onClick={() => generateInvoicePDF(inv)}><Download className="h-3 w-3" /></Button>
                          {inv.status === 'Draft' && <Button size="sm" variant="outline" onClick={() => handleMarkInvoiceSent(inv.id)}><Send className="h-3 w-3 mr-1" />Send</Button>}
                          {inv.status !== 'Paid' && <Button size="sm" variant="outline" onClick={() => handleMarkInvoicePaid(inv.id)}>Mark Paid</Button>}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent></Card>}
          </TabsContent>

          {/* Quotations Tab */}
          <TabsContent value="quotations">
            {isLoading ? <Card><CardContent className="p-6"><Skeleton className="h-64 w-full" /></CardContent></Card> :
            filteredQuotations.length === 0 ? <Card className="text-center py-12"><CardContent><FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><p className="text-muted-foreground">No quotations yet</p></CardContent></Card> :
            <Card><CardContent className="p-0">
              <Table>
                <TableHeader><TableRow>
                  <TableHead>Quotation #</TableHead><TableHead>Client</TableHead><TableHead>Created By</TableHead>
                  <TableHead className="text-right">Total</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {filteredQuotations.map((q) => (
                    <TableRow key={q.id}>
                      <TableCell className="font-medium">{q.quotationNumber}</TableCell>
                      <TableCell>{q.clientName || '-'}</TableCell>
                      <TableCell><div className="flex items-center gap-1"><User className="h-3 w-3 text-muted-foreground" /><span className="text-sm">{q.creatorName || 'Unknown'}</span></div></TableCell>
                      <TableCell className="text-right">RM {q.total.toLocaleString()}</TableCell>
                      <TableCell>{getStatusBadge(q.status)}</TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="ghost" onClick={() => generateQuotationPDF(q)}><Download className="h-3 w-3" /></Button>
                      </TableCell>
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

export default Billing;
