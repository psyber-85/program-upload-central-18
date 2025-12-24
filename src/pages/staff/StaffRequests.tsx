import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { requestsLocalRepo } from '@/lib/dal/localStorage/RequestsLocalRepo';
import { staffLocalRepo } from '@/lib/dal/localStorage/StaffLocalRepo';
import { AnyRequest, TrainingApplication, UserProfile } from '@/lib/dal/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Clock, CheckCircle, XCircle, ChevronRight, GraduationCap, User } from 'lucide-react';
import { format } from 'date-fns';

type DisplayRequest = (AnyRequest | TrainingApplication) & { displayType: 'Leave' | 'Claim' | 'Training'; requestorName?: string };

const StaffRequests = () => {
  const { user, isAdmin } = useAuth();
  const [requests, setRequests] = useState<DisplayRequest[]>([]);
  const [staffMap, setStaffMap] = useState<Map<string, string>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'mine'>('mine');
  const [typeFilter, setTypeFilter] = useState<'All' | 'Leave' | 'Claim' | 'Training'>('All');

  useEffect(() => {
    loadRequests();
  }, [user, filter]);

  const loadRequests = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      // Load staff data for name mapping
      const allStaff = await staffLocalRepo.getAllStaff();
      const nameMap = new Map<string, string>();
      allStaff.forEach(s => nameMap.set(s.id, s.name));
      setStaffMap(nameMap);

      const [leaveRequests, claimRequests, trainingApps] = await Promise.all([
        requestsLocalRepo.getAllLeaveRequests(),
        requestsLocalRepo.getAllClaimRequests(),
        requestsLocalRepo.getAllTrainingApplications(),
      ]);

      const allRequests: DisplayRequest[] = [
        ...leaveRequests.map(r => ({ 
          ...r, 
          displayType: 'Leave' as const,
          requestorName: nameMap.get(r.userId) 
        })),
        ...claimRequests.map(r => ({ 
          ...r, 
          displayType: 'Claim' as const,
          requestorName: nameMap.get(r.userId) 
        })),
        ...trainingApps.map(r => ({ 
          ...r, 
          displayType: 'Training' as const, 
          status: (r.status === 'Submitted' ? 'Pending' : r.status) as any,
          requestorName: nameMap.get(r.userId) 
        })),
      ];

      const filtered = isAdmin && filter === 'all' 
        ? allRequests 
        : allRequests.filter(r => r.userId === user.id);
      
      setRequests(filtered.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ));
    } catch (error) {
      console.error('Failed to load requests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredRequests = requests.filter(r => 
    typeFilter === 'All' || r.displayType === typeFilter
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending':
      case 'Submitted':
        return <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>;
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

  const getRequestSummary = (request: DisplayRequest) => {
    if (request.displayType === 'Leave' && 'leaveType' in request) {
      return `${request.leaveType} Leave: ${format(new Date(request.startDate), 'MMM d')} - ${format(new Date(request.endDate), 'MMM d, yyyy')}`;
    }
    if (request.displayType === 'Claim' && 'amount' in request && 'category' in request) {
      return `${request.category}: RM ${request.amount.toFixed(2)}`;
    }
    if (request.displayType === 'Training' && 'courseName' in request) {
      return `${request.courseName} (RM ${request.cost.toLocaleString()})`;
    }
    return 'Request';
  };

  return (
    <div className="min-h-screen bg-muted/30 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">My Requests</h1>
            <p className="text-muted-foreground">Leave, claims, and training applications</p>
          </div>
          <Button asChild>
            <Link to="/staff/requests/new">
              <Plus className="h-4 w-4 mr-2" />
              New Request
            </Link>
          </Button>
        </header>

        {isAdmin && (
          <div className="mb-4 flex gap-2">
            <Button 
              variant={filter === 'mine' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setFilter('mine')}
            >
              My Requests
            </Button>
            <Button 
              variant={filter === 'all' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setFilter('all')}
            >
              All Requests
            </Button>
          </div>
        )}

        <Tabs value={typeFilter} onValueChange={(v) => setTypeFilter(v as any)} className="mb-6">
          <TabsList>
            <TabsTrigger value="All">All</TabsTrigger>
            <TabsTrigger value="Leave">Leave</TabsTrigger>
            <TabsTrigger value="Claim">Claims</TabsTrigger>
            <TabsTrigger value="Training">
              <GraduationCap className="h-3 w-3 mr-1" />
              Training
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredRequests.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-muted-foreground mb-4">No requests found</p>
              <Button asChild variant="outline">
                <Link to="/staff/requests/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Create your first request
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredRequests.map((request) => (
              <Link key={request.id} to={`/staff/requests/${request.id}`}>
                <Card className="hover:shadow-md hover:border-primary/30 transition-all cursor-pointer">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary" className="text-xs">{request.displayType}</Badge>
                        {getStatusBadge(request.status)}
                      </div>
                      <p className="font-medium truncate">{getRequestSummary(request)}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{format(new Date(request.createdAt), 'MMM d, yyyy')}</span>
                        {isAdmin && filter === 'all' && request.requestorName && (
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {request.requestorName}
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground ml-2 flex-shrink-0" />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffRequests;