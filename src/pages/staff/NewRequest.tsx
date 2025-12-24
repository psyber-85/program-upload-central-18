import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { requestsLocalRepo } from '@/lib/dal/localStorage/RequestsLocalRepo';
import { LeaveRequest, ClaimRequest, RequestType } from '@/lib/dal/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, Loader2, Calendar, Receipt, GraduationCap } from 'lucide-react';
import { format } from 'date-fns';

type RequestFormType = 'Leave' | 'Claim';

const NewRequest = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [requestType, setRequestType] = useState<RequestFormType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Leave form state
  const [leaveType, setLeaveType] = useState<'AL' | 'SL' | 'Custom'>('AL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [halfDay, setHalfDay] = useState(false);
  const [leaveReason, setLeaveReason] = useState('');
  const [customLeaveType, setCustomLeaveType] = useState('');

  // Claim form state
  const [claimAmount, setClaimAmount] = useState('');
  const [claimCategory, setClaimCategory] = useState('');
  const [claimDescription, setClaimDescription] = useState('');

  const handleSubmitLeave = async () => {
    if (!user || !startDate || !endDate || !leaveReason) {
      toast({ title: 'Please fill all required fields', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    try {
      const leaveRequest: Omit<LeaveRequest, 'id' | 'createdAt' | 'updatedAt'> = {
        type: 'Leave',
        userId: user.id,
        status: 'Pending',
        leaveType,
        startDate,
        endDate,
        halfDay,
        reason: leaveReason,
        customLeaveType: leaveType === 'Custom' ? customLeaveType : undefined,
      };

      await requestsLocalRepo.createLeaveRequest(leaveRequest);
      toast({ title: 'Leave request submitted successfully!' });
      navigate('/staff/requests');
    } catch (error) {
      toast({ title: 'Failed to submit request', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitClaim = async () => {
    if (!user || !claimAmount || !claimCategory || !claimDescription) {
      toast({ title: 'Please fill all required fields', variant: 'destructive' });
      return;
    }

    const amount = parseFloat(claimAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({ title: 'Please enter a valid amount', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    try {
      const autoApproved = amount <= 30;
      const claimRequest: Omit<ClaimRequest, 'id' | 'createdAt' | 'updatedAt'> = {
        type: 'Claim',
        userId: user.id,
        status: autoApproved ? 'Approved' : 'Pending',
        amount,
        category: claimCategory,
        description: claimDescription,
        autoApproved,
      };

      await requestsLocalRepo.createClaimRequest(claimRequest);
      toast({ 
        title: autoApproved 
          ? 'Claim auto-approved (≤RM30)!' 
          : 'Claim submitted for approval' 
      });
      navigate('/staff/requests');
    } catch (error) {
      toast({ title: 'Failed to submit request', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!requestType) {
    return (
      <div className="min-h-screen bg-muted/30 p-4 md:p-8">
        <div className="max-w-2xl mx-auto">
          <Button variant="ghost" className="mb-4" onClick={() => navigate('/staff/requests')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Requests
          </Button>

          <h1 className="text-2xl font-bold mb-6">New Request</h1>
          <p className="text-muted-foreground mb-6">What type of request would you like to submit?</p>

          <div className="grid gap-4 md:grid-cols-2">
            <Card 
              className="cursor-pointer hover:shadow-lg hover:border-primary/50 transition-all"
              onClick={() => setRequestType('Leave')}
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                    <Calendar className="h-6 w-6" />
                  </div>
                  <CardTitle>Leave Application</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>Annual leave, sick leave, or custom leave requests</CardDescription>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-lg hover:border-primary/50 transition-all"
              onClick={() => setRequestType('Claim')}
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-100 text-green-600">
                    <Receipt className="h-6 w-6" />
                  </div>
                  <CardTitle>Expense Claim</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>Transport, meals, equipment, and other reimbursements</CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <Button variant="ghost" className="mb-4" onClick={() => setRequestType(null)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>
              {requestType === 'Leave' ? 'Leave Application' : 'Expense Claim'}
            </CardTitle>
            <CardDescription>
              {requestType === 'Leave' 
                ? 'Submit your leave request for approval' 
                : 'Submit your expense claim for reimbursement'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {requestType === 'Leave' && (
              <form onSubmit={(e) => { e.preventDefault(); handleSubmitLeave(); }} className="space-y-4">
                <div className="space-y-2">
                  <Label>Leave Type</Label>
                  <Select value={leaveType} onValueChange={(v) => setLeaveType(v as any)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AL">Annual Leave (AL)</SelectItem>
                      <SelectItem value="SL">Sick Leave (SL)</SelectItem>
                      <SelectItem value="Custom">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {leaveType === 'Custom' && (
                  <div className="space-y-2">
                    <Label>Custom Leave Type</Label>
                    <Input 
                      placeholder="e.g., Compassionate Leave" 
                      value={customLeaveType}
                      onChange={(e) => setCustomLeaveType(e.target.value)}
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Input 
                      type="date" 
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <Input 
                      type="date" 
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      min={startDate}
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="halfDay" 
                    checked={halfDay}
                    onCheckedChange={(checked) => setHalfDay(checked as boolean)}
                  />
                  <Label htmlFor="halfDay" className="cursor-pointer">Half day only</Label>
                </div>

                <div className="space-y-2">
                  <Label>Reason</Label>
                  <Textarea 
                    placeholder="Briefly describe your reason for leave"
                    value={leaveReason}
                    onChange={(e) => setLeaveReason(e.target.value)}
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Submit Leave Request
                </Button>
              </form>
            )}

            {requestType === 'Claim' && (
              <form onSubmit={(e) => { e.preventDefault(); handleSubmitClaim(); }} className="space-y-4">
                <div className="space-y-2">
                  <Label>Amount (RM)</Label>
                  <Input 
                    type="number" 
                    step="0.01"
                    placeholder="0.00"
                    value={claimAmount}
                    onChange={(e) => setClaimAmount(e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">Claims ≤RM30 are auto-approved</p>
                </div>

                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={claimCategory} onValueChange={setClaimCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Transport">Transport</SelectItem>
                      <SelectItem value="Meals">Meals</SelectItem>
                      <SelectItem value="Equipment">Equipment</SelectItem>
                      <SelectItem value="Software">Software</SelectItem>
                      <SelectItem value="Office Supplies">Office Supplies</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea 
                    placeholder="Describe the expense"
                    value={claimDescription}
                    onChange={(e) => setClaimDescription(e.target.value)}
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Submit Claim
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NewRequest;
