import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileSignature, Search, Upload, FileText, Check, Clock, Send, Bell } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { StatusBadge, GenerateDraftButton, FileUploadStub, LOICallout } from '@/components/placement/ui';
import { toast } from 'sonner';
import { loiRepo } from '@/lib/placement/repositories/loiRepo';
import { candidateRepo } from '@/lib/placement/repositories/candidateRepo';
import { roleRequestRepo } from '@/lib/placement/repositories/roleRequestRepo';
import { employerRepo } from '@/lib/placement/repositories/employerRepo';
import { LOIRecord, CandidateProfile, RoleRequest, EmployerCompany } from '@/lib/placement/types';
import { format } from 'date-fns';

const LOI_STATUSES = ['DRAFT', 'PENDING_REVIEW', 'PENDING_SIGNATURE', 'SIGNED'] as const;

export function LOIQueue() {
  const [lois, setLois] = useState<LOIRecord[]>([]);
  const [candidates, setCandidates] = useState<CandidateProfile[]>([]);
  const [roleRequests, setRoleRequests] = useState<RoleRequest[]>([]);
  const [companies, setCompanies] = useState<EmployerCompany[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const [loisData, candidatesData, rolesData, companiesData] = await Promise.all([
        loiRepo.getAll(),
        candidateRepo.getAll(),
        roleRequestRepo.getAll(),
        employerRepo.getCompanies(),
      ]);
      setLois(loisData);
      setCandidates(candidatesData);
      setRoleRequests(rolesData);
      setCompanies(companiesData);
      setLoading(false);
    };
    loadData();
  }, []);

  const getCandidate = (id: string) => candidates.find((c) => c.id === id);
  const getRole = (id: string) => roleRequests.find((r) => r.id === id);
  const getCompany = (id: string) => companies.find((c) => c.id === id);

  const filteredLois = lois.filter((loi) => {
    const candidate = getCandidate(loi.candidate_id);
    const role = getRole(loi.role_request_id);
    const company = getCompany(loi.company_id);

    const matchesSearch =
      candidate?.display_name.toLowerCase().includes(search.toLowerCase()) ||
      role?.title.toLowerCase().includes(search.toLowerCase()) ||
      company?.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || loi.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const statusCounts = {
    DRAFT: lois.filter((l) => l.status === 'DRAFT').length,
    PENDING_REVIEW: lois.filter((l) => l.status === 'PENDING_REVIEW').length,
    PENDING_SIGNATURE: lois.filter((l) => l.status === 'PENDING_SIGNATURE').length,
    SIGNED: lois.filter((l) => l.status === 'SIGNED').length,
  };

  const handleStatusChange = async (loiId: string, newStatus: LOIRecord['status']) => {
    await loiRepo.updateStatus(loiId, newStatus);
    const updatedLois = await loiRepo.getAll();
    setLois(updatedLois);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">LOI Queue</h1>
        <p className="text-muted-foreground">Manage Letters of Intent</p>
      </div>

      {/* Internal Doctrine Reminder */}
      <LOICallout variant="info" className="border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          <strong>Internal Reminder:</strong> LOI ≠ employment contract. The LOI enables AIHQ to proceed with training coordination 
          and grant workflow (subject to approval). Final hiring decision remains with employer.
        </p>
      </LOICallout>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setStatusFilter('DRAFT')}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-muted">
                <FileText className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{statusCounts.DRAFT}</p>
                <p className="text-sm text-muted-foreground">Draft</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setStatusFilter('PENDING_REVIEW')}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-yellow-500/10">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{statusCounts.PENDING_REVIEW}</p>
                <p className="text-sm text-muted-foreground">Pending Review</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setStatusFilter('PENDING_SIGNATURE')}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-blue-500/10">
                <Send className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{statusCounts.PENDING_SIGNATURE}</p>
                <p className="text-sm text-muted-foreground">Pending Signature</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setStatusFilter('SIGNED')}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-green-500/10">
                <Check className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{statusCounts.SIGNED}</p>
                <p className="text-sm text-muted-foreground">Signed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by candidate, role, or company..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {LOI_STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status.replace(/_/g, ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* LOI Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Candidate</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Generated</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLois.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No LOIs found
                  </TableCell>
                </TableRow>
              ) : (
                filteredLois.map((loi) => {
                  const candidate = getCandidate(loi.candidate_id);
                  const role = getRole(loi.role_request_id);
                  const company = getCompany(loi.company_id);

                  return (
                    <TableRow key={loi.id}>
                      <TableCell>
                        <Link
                          to={`/ops/candidates/${loi.candidate_id}`}
                          className="font-medium hover:underline"
                        >
                          {candidate?.display_name || 'Unknown'}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Link
                          to={`/ops/roles/${loi.role_request_id}`}
                          className="hover:underline"
                        >
                          {role?.title || 'Unknown'}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Link
                          to={`/ops/employers/${loi.company_id}`}
                          className="hover:underline"
                        >
                          {company?.name || 'Unknown'}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={loi.status}
                          onValueChange={(value) => handleStatusChange(loi.id, value as LOIRecord['status'])}
                        >
                          <SelectTrigger className="w-[160px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {LOI_STATUSES.map((status) => (
                              <SelectItem key={status} value={status}>
                                {status.replace(/_/g, ' ')}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {loi.generated_at
                          ? format(new Date(loi.generated_at), 'MMM d, yyyy')
                          : '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {loi.status === 'DRAFT' && (
                            <GenerateDraftButton
                              onGenerate={() => handleStatusChange(loi.id, 'PENDING_REVIEW')}
                            />
                          )}
                          {loi.status === 'PENDING_SIGNATURE' && (
                            <>
                              <FileUploadStub
                                label="Upload Signed"
                                onUpload={() => handleStatusChange(loi.id, 'SIGNED')}
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => toast.success('LOI reminder sent to employer')}
                              >
                                <Bell className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
