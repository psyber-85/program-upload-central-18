import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { requestsLocalRepo } from '@/lib/dal/localStorage/RequestsLocalRepo';
import { staffLocalRepo } from '@/lib/dal/localStorage/StaffLocalRepo';
import { AnyRequest, TrainingApplication, LeaveRequest } from '@/lib/dal/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, Clock, CheckCircle, XCircle, Loader2, ExternalLink, GraduationCap } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';

type DisplayRequest = AnyRequest | TrainingApplication;

const RequestDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [request, setRequest] = useState<DisplayRequest | null>(null);
  const [requestCategory, setRequestCategory] = useState<'leave' | 'claim' | 'training' | null>(null);
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
      // Try leave requests first
      const leaveRequest = await requestsLocalRepo.getLeaveRequestById(id);
      if (leaveRequest) {
        setRequest(leaveRequest);
        setRequestCategory('leave');
        setIsLoading(false);
        return;
      }
      
      // Then claims
      const claimRequest = await requestsLocalRepo.getClaimRequestById(id);
      if (claimRequest) {
        setRequest(claimRequest);
        setRequestCategory('claim');
        setIsLoading(false);
        return;
      }

      // Finally training
      const trainingApp = await requestsLocalRepo.getTrainingApplicationById(id);
      if (trainingApp) {
        setRequest(trainingApp);
        setRequestCategory('training');
        setIsLoading(false);
        return;
      }

      setRequest(null);
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
      if (requestCategory === 'leave') {
        const leaveReq = request as LeaveRequest;
        
        // Approve the request
        await requestsLocalRepo.updateLeaveRequestStatus(
          request.id, 
          'Approved', 
          adminComment || undefined
        );
        
        // Deduct leave balance
        const daysRequested = leaveReq.halfDay 
          ? 0.5 
          : differenceInDays(new Date(leaveReq.endDate), new Date(leaveReq.startDate)) + 1;
        
        const currentYear = new Date().getFullYear();
        const currentBalance = await staffLocalRepo.getLeaveBalance(leaveReq.userId, currentYear);
        
        if (currentBalance) {
          if (leaveReq.leaveType === 'AL') {
            await staffLocalRepo.updateLeaveBalance(leaveReq.userId, currentYear, {
              alUsed: currentBalance.alUsed + daysRequested,
            });
          } else if (leaveReq.leaveType === 'SL') {
            await staffLocalRepo.updateLeaveBalance(leaveReq.userId, currentYear, {
              slUsed: currentBalance.slUsed + daysRequested,
            });
          }
        }
      } else if (requestCategory === 'claim') {
        await requestsLocalRepo.updateClaimRequestStatus(
          request.id, 
          'Approved', 
          adminComment || undefined
        );
      } else if (requestCategory === 'training') {
        await requestsLocalRepo.approveTrainingApplication(request.id);
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
    if (!request) return;
    if (requestCategory !== 'training' && !adminComment) {
      toast({ title: 'Please provide a reason for rejection', variant: 'destructive' });
      return;
    }
    setIsProcessing(true);
    try {
      if (requestCategory === 'leave') {
        await requestsLocalRepo.updateLeaveRequestStatus(
          request.id, 
          'Rejected', 
          adminComment
        );
      } else if (requestCategory === 'claim') {
        await requestsLocalRepo.updateClaimRequestStatus(
          request.id, 
          'Rejected', 
          adminComment
        );
      } else if (requestCategory === 'training') {
        await requestsLocalRepo.rejectTrainingApplication(request.id);
      }
      toast({ title: 'Request rejected' });
      navigate('/staff/requests');
    } catch (error) {
      toast({ title: 'Failed to reject', variant: 'destructive' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMarkCompleted = async () => {
    if (!request || requestCategory !== 'training') return;
    setIsProcessing(true);
    try {
      await requestsLocalRepo.markTrainingCompleted(request.id);
      toast({ title: 'Training marked as completed!' });
      loadRequest();
    } catch (error) {
      toast({ title: 'Failed to update', variant: 'destructive' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClaimTraining = async () => {
    if (!request || requestCategory !== 'training') return;
    setIsProcessing(true);
    try {
      await requestsLocalRepo.markTrainingClaimed(request.id);
      toast({ title: 'Training marked as claimed!' });
      loadRequest();
    } catch (error) {
      toast({ title: 'Failed to update', variant: 'destructive' });
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending':
      case 'Submitted':
        return <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50"><Clock className="h-3 w-3 mr-1" /> {status}</Badge>;
      case 'Approved':
        return <Badge variant="outline" className="text-green-600 border-green-300 bg-green-50"><CheckCircle className="h-3 w-3 mr-1" /> Approved</Badge>;
      case 'Rejected':
        return <Badge variant="outline" className="text-red-600 border-red-300 bg-red-50"><XCircle className="h-3 w-3 mr-1" /> Rejected</Badge>;
      case 'Completed':
        return <Badge variant="outline" className="text-blue-600 border-blue-300 bg-blue-50"><CheckCircle className="h-3 w-3 mr-1" /> Completed</Badge>;
      case 'Claimed':
        return <Badge variant="outline" className="text-purple-600 border-purple-300 bg-purple-50"><CheckCircle className="h-3 w-3 mr-1" /> Claimed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const isTrainingApp = (req: DisplayRequest): req is TrainingApplication => {
    return 'courseName' in req;
  };

  const isLeaveRequest = (req: DisplayRequest): req is AnyRequest & { type: 'Leave' } => {
    return 'type' in req && req.type === 'Leave';
  };

  const isClaimRequest = (req: DisplayRequest): req is AnyRequest & { type: 'Claim' } => {
    return 'type' in req && req.type === 'Claim';
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

  const canApprove = isAdmin && 
    (isTrainingApp(request) 
      ? request.status === 'Submitted' 
      : request.status === 'Pending') && 
    request.userId !== user?.id;

  const canMarkCompleted = !isAdmin && 
    isTrainingApp(request) && 
    request.status === 'Approved' && 
    request.userId === user?.id;

  const canClaim = !isAdmin && 
    isTrainingApp(request) && 
    request.status === 'Completed' && 
    request.userId === user?.id;

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
                <Badge variant="secondary" className="mb-2">
                  {isTrainingApp(request) ? 'Training' : request.type}
                </Badge>
                <CardTitle>
                  {isTrainingApp(request) ? 'Training Application' : 
                   isLeaveRequest(request) ? 'Leave Request' : 'Expense Claim'}
                </CardTitle>
                <CardDescription>
                  Submitted on {format(new Date(request.createdAt), 'MMM d, yyyy')}
                </CardDescription>
              </div>
              {getStatusBadge(request.status)}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLeaveRequest(request) && (
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

            {isClaimRequest(request) && (
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

            {isTrainingApp(request) && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Course Name</Label>
                    <p className="font-medium">{request.courseName}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Provider</Label>
                    <p className="font-medium">{request.provider}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Cost</Label>
                    <p className="font-medium text-lg">RM {request.cost.toLocaleString()}</p>
                  </div>
                  {request.link && (
                    <div>
                      <Label className="text-muted-foreground">Course Link</Label>
                      <a 
                        href={request.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="font-medium text-primary flex items-center gap-1 hover:underline"
                      >
                        View Course <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}
                </div>
                <div>
                  <Label className="text-muted-foreground">Justification</Label>
                  <p className="font-medium">{request.justification}</p>
                </div>
                {request.approvedAt && (
                  <div>
                    <Label className="text-muted-foreground">Approved On</Label>
                    <p className="font-medium">{format(new Date(request.approvedAt), 'MMM d, yyyy')}</p>
                  </div>
                )}
                {request.completedAt && (
                  <div>
                    <Label className="text-muted-foreground">Completed On</Label>
                    <p className="font-medium">{format(new Date(request.completedAt), 'MMM d, yyyy')}</p>
                  </div>
                )}
              </>
            )}

            {!isTrainingApp(request) && request.adminComment && (
              <div className="mt-4 p-3 bg-muted rounded-md">
                <Label className="text-muted-foreground">Admin Comment</Label>
                <p className="font-medium">{request.adminComment}</p>
              </div>
            )}

            {/* Staff actions for training */}
            {canMarkCompleted && (
              <div className="border-t pt-4 mt-6">
                <Button onClick={handleMarkCompleted} disabled={isProcessing} className="w-full">
                  {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <GraduationCap className="h-4 w-4 mr-2" />
                  Mark as Completed
                </Button>
              </div>
            )}

            {canClaim && (
              <div className="border-t pt-4 mt-6">
                <Button onClick={handleClaimTraining} disabled={isProcessing} className="w-full">
                  {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Submit Claim for Reimbursement
                </Button>
              </div>
            )}

            {/* Admin approval actions */}
            {canApprove && (
              <div className="border-t pt-4 mt-6 space-y-4">
                {requestCategory !== 'training' && (
                  <div className="space-y-2">
                    <Label>Comment (required for rejection)</Label>
                    <Textarea 
                      placeholder="Add a comment..."
                      value={adminComment}
                      onChange={(e) => setAdminComment(e.target.value)}
                    />
                  </div>
                )}
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
                    disabled={isProcessing || (requestCategory !== 'training' && !adminComment)}
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