import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Wallet, Search, Plus, FileText, Clock, Check, X, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { candidateRepo } from '@/lib/placement/repositories/candidateRepo';
import { employerRepo } from '@/lib/placement/repositories/employerRepo';
import { GrantCase, CandidateProfile, EmployerCompany } from '@/lib/placement/types';
import { format } from 'date-fns';

// Mock grant data
const mockGrants: GrantCase[] = [
  {
    id: 'grant-001',
    company_id: 'comp-001',
    candidate_id: 'cand-001',
    status: 'SUBMITTED',
    notes: 'All documents submitted, awaiting WSG review',
    created_at: '2024-03-01T08:00:00Z',
    last_updated: '2024-03-20T10:00:00Z',
  },
  {
    id: 'grant-002',
    company_id: 'comp-002',
    candidate_id: 'cand-007',
    status: 'APPROVED',
    notes: 'Approved for RM 15,000 training subsidy',
    created_at: '2024-02-15T09:00:00Z',
    last_updated: '2024-03-15T11:00:00Z',
  },
  {
    id: 'grant-003',
    company_id: 'comp-003',
    candidate_id: 'cand-005',
    status: 'COMPLETED',
    notes: 'Grant disbursed successfully',
    created_at: '2024-01-20T10:00:00Z',
    last_updated: '2024-03-10T12:00:00Z',
  },
];

const GRANT_STATUSES = ['PENDING', 'SUBMITTED', 'APPROVED', 'REJECTED', 'COMPLETED'] as const;

export function GrantsManagement() {
  const [grants, setGrants] = useState<GrantCase[]>(mockGrants);
  const [candidates, setCandidates] = useState<CandidateProfile[]>([]);
  const [companies, setCompanies] = useState<EmployerCompany[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [noteValue, setNoteValue] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const [candidatesData, companiesData] = await Promise.all([
        candidateRepo.getAll(),
        employerRepo.getCompanies(),
      ]);
      setCandidates(candidatesData);
      setCompanies(companiesData);
      setLoading(false);
    };
    loadData();
  }, []);

  const getCandidate = (id: string) => candidates.find((c) => c.id === id);
  const getCompany = (id: string) => companies.find((c) => c.id === id);

  const filteredGrants = grants.filter((grant) => {
    const candidate = getCandidate(grant.candidate_id);
    const company = getCompany(grant.company_id);

    const matchesSearch =
      candidate?.display_name.toLowerCase().includes(search.toLowerCase()) ||
      company?.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || grant.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const statusCounts = {
    PENDING: grants.filter((g) => g.status === 'PENDING').length,
    SUBMITTED: grants.filter((g) => g.status === 'SUBMITTED').length,
    APPROVED: grants.filter((g) => g.status === 'APPROVED').length,
    REJECTED: grants.filter((g) => g.status === 'REJECTED').length,
    COMPLETED: grants.filter((g) => g.status === 'COMPLETED').length,
  };

  const handleStatusChange = (grantId: string, newStatus: GrantCase['status']) => {
    setGrants((prev) =>
      prev.map((g) =>
        g.id === grantId ? { ...g, status: newStatus, last_updated: new Date().toISOString() } : g
      )
    );
  };

  const handleSaveNote = (grantId: string) => {
    setGrants((prev) =>
      prev.map((g) =>
        g.id === grantId ? { ...g, notes: noteValue, last_updated: new Date().toISOString() } : g
      )
    );
    setEditingNote(null);
    setNoteValue('');
  };

  const getStatusIcon = (status: GrantCase['status']) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-4 w-4 text-muted-foreground" />;
      case 'SUBMITTED':
        return <FileText className="h-4 w-4 text-blue-600" />;
      case 'APPROVED':
        return <Check className="h-4 w-4 text-green-600" />;
      case 'REJECTED':
        return <X className="h-4 w-4 text-red-600" />;
      case 'COMPLETED':
        return <Check className="h-4 w-4 text-green-600" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Grants Management</h1>
          <p className="text-muted-foreground">Track and manage grant applications</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Grant Case
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {GRANT_STATUSES.map((status) => (
          <Card
            key={status}
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setStatusFilter(statusFilter === status ? 'all' : status)}
          >
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-muted">{getStatusIcon(status)}</div>
                <div>
                  <p className="text-2xl font-bold">{statusCounts[status]}</p>
                  <p className="text-sm text-muted-foreground capitalize">{status.toLowerCase()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by candidate or company..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {GRANT_STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Grants Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Candidate</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredGrants.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No grant cases found
                  </TableCell>
                </TableRow>
              ) : (
                filteredGrants.map((grant) => {
                  const candidate = getCandidate(grant.candidate_id);
                  const company = getCompany(grant.company_id);

                  return (
                    <TableRow key={grant.id}>
                      <TableCell>
                        <Link
                          to={`/ops/employers/${grant.company_id}`}
                          className="font-medium hover:underline"
                        >
                          {company?.name || 'Unknown'}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Link
                          to={`/ops/candidates/${grant.candidate_id}`}
                          className="hover:underline"
                        >
                          {candidate?.display_name || 'Unknown'}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={grant.status}
                          onValueChange={(value) =>
                            handleStatusChange(grant.id, value as GrantCase['status'])
                          }
                        >
                          <SelectTrigger className="w-[140px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {GRANT_STATUSES.map((status) => (
                              <SelectItem key={status} value={status}>
                                {status}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="max-w-[200px]">
                        <p className="text-sm text-muted-foreground truncate">
                          {grant.notes || '-'}
                        </p>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(grant.last_updated), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingNote(grant.id);
                                setNoteValue(grant.notes || '');
                              }}
                            >
                              Edit Note
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit Grant Notes</DialogTitle>
                              <DialogDescription>
                                Update notes for {company?.name} - {candidate?.display_name}
                              </DialogDescription>
                            </DialogHeader>
                            <Textarea
                              value={noteValue}
                              onChange={(e) => setNoteValue(e.target.value)}
                              placeholder="Enter notes..."
                              className="min-h-[100px]"
                            />
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setEditingNote(null)}>
                                Cancel
                              </Button>
                              <Button onClick={() => handleSaveNote(grant.id)}>Save</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
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
