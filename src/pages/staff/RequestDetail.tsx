import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { requestsLocalRepo } from '@/lib/dal/localStorage/RequestsLocalRepo';
import { AnyRequest } from '@/lib/dal/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

const RequestDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [request, setRequest] = useState<AnyRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [adminComment, setAdminComment] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadRequest();
  }, [id]);

  const loadRequest = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const allRequests = await requestsLocalRepo.getAllRequests();
      const found = allRequests.find(r => r.id === id);
      setRequest(found || null);
    } catch (error) {
      console.error('Failed to load request:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!request) return;
    setIsProcessing(true);
    try {
      if (request.type === 'Leave') {
        await requestsLocalRepo.updateLeaveRequest(request.id, {
          status: 'Approved',
          adminComment: adminComment || undefined,
        });
      } else if (request.type === 'Claim') {
        await requestsLocalRepo.updateClaimRequest(request.id, {
          status: 'Approved',
          adminComment: adminComment || undefined,
        });
      }
      toast({ title: 'Request approved!' });
      navigate('/staff/requests');
    } catch (error) {
      toast({ title: 'Failed to approve', variant: 'destructive' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!request || !adminComment) {
      toast({ title: 'Please provide a reason for rejection', variant: 'destructive' });
      return;
    }
    setIsProcessing(true);
    try {
      if (request.type === 'Leave') {
        await requestsLocalRepo.updateLeaveRequest(request.id, {
          status: 'Rejected',
          adminComment,
        });
      } else if (request.type === 'Claim') {
        await requestsLocalRepo.updateClaimRequest(request.id, {
          status: 'Rejected',
          adminComment,
        });
      }
      toast({ title: 'Request rejected' });
      navigate('/staff/requests');
    } catch (error) {
      toast({ title: 'Failed to reject', variant: 'destructive' });
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending':
        return <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>;
      case 'Approved':
        return <Badge variant="outline" className="text-green-600 border-green-300 bg-green-50"><CheckCircle className="h-3 w-3 mr-1" /> Approved</Badge>;
      case 'Rejected':
        return <Badge variant="outline" className="text-red-600 border-red-300 bg-red-50"><XCircle className="h-3 w-3 mr-1" /> Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted/30 p-4 md:p-8">
        <div className="max-w-2xl mx-auto">
          <Skeleton className="h-8 w-32 mb-4" />
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-6 w-3/4 mb-4" />
              <Skeleton className="h-4 w-1/2 mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen bg-muted/30 p-4 md:p-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Request not found</h1>
          <Button onClick={() => navigate('/staff/requests')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Requests
          </Button>
        </div>
      </div>
    );
  }

  const canApprove = isAdmin && request.status === 'Pending' && request.userId !== user?.id;

  return (
    <div className="min-h-screen bg-muted/30 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <Button variant="ghost" className="mb-4" onClick={() => navigate('/staff/requests')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Requests
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <Badge variant="secondary" className="mb-2">{request.type}</Badge>
                <CardTitle>{request.type === 'Leave' ? 'Leave Request' : 'Expense Claim'}</CardTitle>
                <CardDescription>
                  Submitted on {format(new Date(request.createdAt), 'MMM d, yyyy')}
                </CardDescription>
              </div>
              {getStatusBadge(request.status)}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {request.type === 'Leave' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Leave Type</Label>
                    <p className="font-medium">{request.leaveType === 'Custom' ? request.customLeaveType : request.leaveType}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Half Day</Label>
                    <p className="font-medium">{request.halfDay ? 'Yes' : 'No'}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Start Date</Label>
                    <p className="font-medium">{format(new Date(request.startDate), 'MMM d, yyyy')}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">End Date</Label>
                    <p className="font-medium">{format(new Date(request.endDate), 'MMM d, yyyy')}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Reason</Label>
                  <p className="font-medium">{request.reason}</p>
                </div>
              </>
            )}

            {request.type === 'Claim' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Amount</Label>
                    <p className="font-medium text-lg">RM {request.amount.toFixed(2)}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Category</Label>
                    <p className="font-medium">{request.category}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Description</Label>
                  <p className="font-medium">{request.description}</p>
                </div>
                {request.autoApproved && (
                  <Badge variant="secondary" className="text-green-600">Auto-approved (≤RM30)</Badge>
                )}
              </>
            )}

            {request.adminComment && (
              <div className="mt-4 p-3 bg-muted rounded-md">
                <Label className="text-muted-foreground">Admin Comment</Label>
                <p className="font-medium">{request.adminComment}</p>
              </div>
            )}

            {canApprove && (
              <div className="border-t pt-4 mt-6 space-y-4">
                <div className="space-y-2">
                  <Label>Comment (required for rejection)</Label>
                  <Textarea 
                    placeholder="Add a comment..."
                    value={adminComment}
                    onChange={(e) => setAdminComment(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={handleApprove} 
                    disabled={isProcessing}
                    className="flex-1"
                  >
                    {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={handleReject} 
                    disabled={isProcessing || !adminComment}
                    className="flex-1"
                  >
                    {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RequestDetail;
