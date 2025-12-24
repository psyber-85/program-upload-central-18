import React, { useState, useEffect } from 'react';
import { entriesLocalRepo } from '@/lib/dal/localStorage/EntriesLocalRepo';
import { useAuth } from '@/contexts/AuthContext';
import { Invoice } from '@/lib/dal/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Plus, FileText, CheckCircle, Clock, Send, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

const MyEntries = () => {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
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
      const allInvoices = await entriesLocalRepo.getAllInvoices();
      // Filter to only show user's own invoices
      const myInvoices = allInvoices.filter(inv => inv.createdBy === user.id);
      setInvoices(myInvoices);
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

  const handleMarkInvoiceSent = async (id: string) => {
    try {
      await entriesLocalRepo.markInvoiceSent(id);
      toast({ title: 'Invoice marked as sent!' });
      loadData();
    } catch (error) {
      toast({ title: 'Failed to update invoice', variant: 'destructive' });
    }
  };

  const resetInvoiceForm = () => {
    setInvoiceClient('');
    setInvoiceBusinessArm('Training');
    setInvoiceAmount('');
    setInvoiceDescription('');
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
        <header className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">My Invoices</h1>
            <p className="text-muted-foreground">Create and manage your quotations and invoices</p>
          </div>
          <Dialog open={showInvoiceDialog} onOpenChange={setShowInvoiceDialog}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />New Invoice</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Invoice</DialogTitle>
                <DialogDescription>Create a new invoice or quotation</DialogDescription>
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
        </header>

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
      </div>
    </div>
  );
};

export default MyEntries;
