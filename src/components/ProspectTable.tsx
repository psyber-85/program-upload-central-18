import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from '@/components/ui/pagination';
import { Phone, Mail, User, Building, AlertCircle, Search, ChevronUp, ChevronDown, Eye, ChevronRight, ChevronLeft, Info, Plus, Filter } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import LogCallModal from './LogCallModal';
import AddHRContactModal from './AddHRContactModal';
import NotifyHRModal from './NotifyHRModal';
import UpdateStatusModal from './UpdateStatusModal';
import ViewCallNotesModal from './ViewCallNotesModal';
import AddProspectModal from './AddProspectModal';

interface HRContact {
  name: string;
  email: string;
  email_sent_at?: string | null;
}

interface Prospect {
  id: string;
  program: string;
  name: string;
  email: string;
  phone: string | null;
  org: string | null;
  role: string | null;
  payment: string | null;
  product_type: string | null;
  registration_status: 'Pending' | 'Approved' | 'Rejected' | 'Postponed' | 'On Hold';
  status_reason?: string | null;
  lastCall?: string;
  hrContact?: HRContact;
  hasCallNotes?: boolean;
}

type SortField = 'name' | 'email' | 'org' | 'role' | 'program' | 'registration_status' | 'payment' | 'lastCall';
type SortDirection = 'asc' | 'desc';

const ProspectTable = () => {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [filteredProspects, setFilteredProspects] = useState<Prospect[]>([]);
  const [programs, setPrograms] = useState<{[key: string]: string}>({});
  const [selectedProspect, setSelectedProspect] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [programFilter, setProgramFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [prospectsPerPage] = useState(10);
  const [showSecondaryColumns, setShowSecondaryColumns] = useState(false);
  const [addProspectModalOpen, setAddProspectModalOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchProspects();
    
    // Set up real-time subscription for prospects
    const prospectsChannel = supabase
      .channel('prospects-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'prospects'
        },
        () => {
          console.log('Prospect data changed, refreshing...');
          fetchProspects();
        }
      )
      .subscribe();

    // Set up real-time subscription for HR contacts
    const hrChannel = supabase
      .channel('hr-contacts-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'hr_contacts'
        },
        () => {
          console.log('HR contact data changed, refreshing...');
          fetchProspects();
        }
      )
      .subscribe();

    // Set up real-time subscription for calls
    const callsChannel = supabase
      .channel('calls-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'prospect_calls'
        },
        () => {
          console.log('Call data changed, refreshing...');
          fetchProspects();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(prospectsChannel);
      supabase.removeChannel(hrChannel);
      supabase.removeChannel(callsChannel);
    };
  }, []);

  useEffect(() => {
    // Filter and sort prospects
    let filtered = prospects.filter(prospect => {
      const matchesSearch = prospect.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prospect.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prospect.program.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (prospect.org && prospect.org.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (prospect.role && prospect.role.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = statusFilter === 'all' || prospect.registration_status === statusFilter;
      const matchesProgram = programFilter === 'all' || prospect.program === programFilter;
      
      return matchesSearch && matchesStatus && matchesProgram;
    });

    // Sort prospects
    filtered.sort((a, b) => {
      let aValue = a[sortField] || '';
      let bValue = b[sortField] || '';
      
      if (sortField === 'lastCall') {
        aValue = a.lastCall || '1900-01-01';
        bValue = b.lastCall || '1900-01-01';
      }
      
      if (sortDirection === 'asc') {
        return aValue.toString().localeCompare(bValue.toString());
      } else {
        return bValue.toString().localeCompare(aValue.toString());
      }
    });

    setFilteredProspects(filtered);
    
    // Only reset to first page when filters change, not when data updates
    const newTotalPages = Math.ceil(filtered.length / prospectsPerPage);
    if (currentPage > newTotalPages && newTotalPages > 0) {
      setCurrentPage(newTotalPages);
    }
  }, [searchTerm, statusFilter, programFilter, prospects, sortField, sortDirection, prospectsPerPage]);

  // Separate useEffect to handle filter changes that should reset page
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, programFilter]);

  const fetchProspects = async () => {
    try {
      setLoading(true);
      
      // Fetch programs first - ensure we get actual program names
      const { data: programsData, error: programsError } = await supabase
        .from('programs')
        .select('id, title')
        .order('title');
      
      if (programsError) throw programsError;
      
      const programsMap = programsData?.reduce((acc, program) => {
        acc[program.id] = program.title;
        return acc;
      }, {} as {[key: string]: string}) || {};
      
      setPrograms(programsMap);

      // Fetch prospects with related data including status_reason
      const { data: prospectsData, error: prospectsError } = await supabase
        .from('prospects')
        .select(`
          *,
          prospect_calls(call_date, notes),
          hr_contacts(name, email, email_sent_at)
        `)
        .order('created_at', { ascending: false });

      if (prospectsError) throw prospectsError;

      const formattedProspects: Prospect[] = prospectsData?.map(prospect => {
        const lastCall = prospect.prospect_calls?.length > 0 
          ? prospect.prospect_calls.sort((a: any, b: any) => new Date(b.call_date).getTime() - new Date(a.call_date).getTime())[0].call_date
          : undefined;
        
        const hrContact = prospect.hr_contacts?.length > 0 ? prospect.hr_contacts[0] : undefined;
        const hasCallNotes = prospect.prospect_calls?.some((call: any) => call.notes && call.notes.trim() !== '') || false;

        return {
          id: prospect.id,
          program: programsMap[prospect.program_id] || 'Unknown Program',
          name: prospect.name,
          email: prospect.email,
          phone: prospect.phone,
          org: prospect.org,
          role: prospect.role,
          payment: prospect.payment,
          product_type: prospect.product_type,
          registration_status: prospect.registration_status as Prospect['registration_status'],
          status_reason: prospect.status_reason,
          lastCall: lastCall ? new Date(lastCall).toLocaleDateString() : undefined,
          hrContact: hrContact ? {
            name: hrContact.name,
            email: hrContact.email,
            email_sent_at: hrContact.email_sent_at
          } : undefined,
          hasCallNotes
        };
      }) || [];

      setProspects(formattedProspects);
    } catch (error) {
      console.error('Error fetching prospects:', error);
      toast({
        title: "Error",
        description: "Failed to load prospects",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />;
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Approved': return 'default';
      case 'Rejected': return 'destructive';
      case 'Pending': return 'secondary';
      case 'Postponed': return 'outline';
      case 'On Hold': return 'secondary';
      default: return 'secondary';
    }
  };

  const getPaymentBadgeVariant = (status: string | null) => {
    if (!status) return 'outline';
    
    const normalizedStatus = status.toLowerCase();
    switch (normalizedStatus) {
      case 'hrdc': return 'default';
      case 'individual': return 'secondary';
      case 'paid': return 'default';
      case 'pending': return 'outline';
      default: return 'outline';
    }
  };

  const formatPaymentDisplay = (payment: string | null) => {
    if (!payment) return 'Not Set';
    
    // Capitalize first letter for display
    return payment.charAt(0).toUpperCase() + payment.slice(1).toLowerCase();
  };

  const handleModalOpen = (modalType: string, prospectId: string) => {
    setSelectedProspect(prospectId);
    setActiveModal(modalType);
  };

  const handleModalClose = () => {
    setSelectedProspect(null);
    setActiveModal(null);
  };

  const refreshProspects = () => {
    fetchProspects();
  };

  // Smart pagination calculations
  const totalPages = Math.ceil(filteredProspects.length / prospectsPerPage);
  const startIndex = (currentPage - 1) * prospectsPerPage;
  const endIndex = startIndex + prospectsPerPage;
  const currentProspects = filteredProspects.slice(startIndex, endIndex);

  // Smart pagination page numbers
  const getVisiblePages = () => {
    const maxVisible = 5;
    const pages = [];
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    
    return pages;
  };

  // Get unique programs for filter dropdown
  const uniquePrograms = Array.from(new Set(prospects.map(p => p.program))).sort();

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <span className="ml-2">Loading prospects...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Search Bar, Filters, Column Toggle, and Add Prospect Button */}
      <div className="p-4 border-b">
        <div className="flex flex-col gap-4">
          {/* First Row: Search and Add Prospect */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search prospects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setAddProspectModalOpen(true)}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Prospect
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSecondaryColumns(!showSecondaryColumns)}
                className="flex items-center gap-2"
              >
                {showSecondaryColumns ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                {showSecondaryColumns ? 'Hide Details' : 'Show Details'}
              </Button>
            </div>
          </div>
          
          {/* Second Row: Filters */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filters:</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                  <SelectItem value="On Hold">On Hold</SelectItem>
                  <SelectItem value="Postponed">Postponed</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={programFilter} onValueChange={setProgramFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter by Programme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Programmes</SelectItem>
                  {uniquePrograms.map((program) => (
                    <SelectItem key={program} value={program}>
                      {program}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {(statusFilter !== 'all' || programFilter !== 'all') && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setStatusFilter('all');
                    setProgramFilter('all');
                  }}
                  className="text-xs"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-2 text-sm text-gray-600">
          Showing {filteredProspects.length} of {prospects.length} prospects
          {(statusFilter !== 'all' || programFilter !== 'all') && (
            <span className="ml-2 text-blue-600">
              (filtered by {statusFilter !== 'all' ? `status: ${statusFilter}` : ''}{statusFilter !== 'all' && programFilter !== 'all' ? ', ' : ''}{programFilter !== 'all' ? `programme: ${programFilter}` : ''})
            </span>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="cursor-pointer" onClick={() => handleSort('program')}>
                <div className="flex items-center gap-1">
                  Programme {getSortIcon('program')}
                </div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('name')}>
                <div className="flex items-center gap-1">
                  Name {getSortIcon('name')}
                </div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('registration_status')}>
                <div className="flex items-center gap-1">
                  Status {getSortIcon('registration_status')}
                </div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('payment')}>
                <div className="flex items-center gap-1">
                  Payment {getSortIcon('payment')}
                </div>
              </TableHead>
              {showSecondaryColumns && (
                <>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('email')}>
                    <div className="flex items-center gap-1">
                      Email {getSortIcon('email')}
                    </div>
                  </TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('org')}>
                    <div className="flex items-center gap-1">
                      Company {getSortIcon('org')}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('role')}>
                    <div className="flex items-center gap-1">
                      Job Role {getSortIcon('role')}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('lastCall')}>
                    <div className="flex items-center gap-1">
                      Last Call {getSortIcon('lastCall')}
                    </div>
                  </TableHead>
                  <TableHead>HR Contact</TableHead>
                  <TableHead>HR Email</TableHead>
                  <TableHead>HR Email Sent</TableHead>
                </>
              )}
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentProspects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={showSecondaryColumns ? 13 : 5} className="text-center py-6">
                  {searchTerm || statusFilter !== 'all' || programFilter !== 'all' 
                    ? 'No prospects found matching your filters.' 
                    : 'No prospects found. Add some prospects to get started.'}
                </TableCell>
              </TableRow>
            ) : (
              currentProspects.map((prospect) => (
                <TableRow key={prospect.id}>
                  <TableCell className="font-medium max-w-xs">
                    <div className="truncate" title={prospect.program}>
                      {prospect.program}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{prospect.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusBadgeVariant(prospect.registration_status)}>
                        {prospect.registration_status}
                      </Badge>
                      {prospect.status_reason && (
                        <div className="group relative">
                          <Info className="w-4 h-4 text-gray-400 cursor-help" />
                          <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-10 max-w-xs">
                            {prospect.status_reason}
                          </div>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getPaymentBadgeVariant(prospect.payment)}>
                      {formatPaymentDisplay(prospect.payment)}
                    </Badge>
                  </TableCell>
                  {showSecondaryColumns && (
                    <>
                      <TableCell className="max-w-xs">
                        <div className="truncate" title={prospect.email}>
                          {prospect.email}
                        </div>
                      </TableCell>
                      <TableCell>{prospect.phone || '—'}</TableCell>
                      <TableCell className="max-w-xs">
                        <div className="truncate" title={prospect.org || ''}>
                          {prospect.org || '—'}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="truncate" title={prospect.role || ''}>
                          {prospect.role || '—'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {prospect.lastCall || '—'}
                          {prospect.hasCallNotes && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleModalOpen('viewNotes', prospect.id)}
                              className="p-1 h-auto"
                            >
                              <Eye className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {prospect.hrContact?.name || '—'}
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="truncate" title={prospect.hrContact?.email || ''}>
                          {prospect.hrContact?.email || '—'}
                        </div>
                      </TableCell>
                      <TableCell>
                        {prospect.hrContact?.email_sent_at ? (
                          <div className="flex items-center gap-1">
                            <span className="text-green-600">✅</span>
                            <span className="text-xs text-gray-500">
                              {new Date(prospect.hrContact.email_sent_at).toLocaleDateString()}
                            </span>
                          </div>
                        ) : '—'}
                      </TableCell>
                    </>
                  )}
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleModalOpen('call', prospect.id)}
                          className="text-xs px-2"
                        >
                          <Phone className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleModalOpen('hr', prospect.id)}
                          className="text-xs px-2"
                        >
                          <User className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleModalOpen('status', prospect.id)}
                          className="text-xs px-2"
                        >
                          <AlertCircle className="w-3 h-3" />
                        </Button>
                      </div>
                      {prospect.hrContact?.email && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleModalOpen('notify', prospect.id)}
                          className="text-xs"
                        >
                          <Mail className="w-3 h-3 mr-1" />
                          Email HR
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Smart Pagination */}
      {totalPages > 1 && (
        <div className="p-4 border-t">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
              
              {getVisiblePages().map((page, index) => (
                <PaginationItem key={index}>
                  {page === '...' ? (
                    <PaginationEllipsis />
                  ) : (
                    <PaginationLink
                      onClick={() => setCurrentPage(page as number)}
                      isActive={currentPage === page}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  )}
                </PaginationItem>
              ))}
              
              <PaginationItem>
                <PaginationNext 
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Modals */}
      <LogCallModal
        isOpen={activeModal === 'call'}
        onClose={handleModalClose}
        prospectId={selectedProspect || ''}
        onComplete={refreshProspects}
      />
      <AddHRContactModal
        isOpen={activeModal === 'hr'}
        onClose={handleModalClose}
        prospectId={selectedProspect || ''}
        onComplete={refreshProspects}
      />
      <NotifyHRModal
        isOpen={activeModal === 'notify'}
        onClose={handleModalClose}
        prospectId={selectedProspect || ''}
        onComplete={refreshProspects}
      />
      <UpdateStatusModal
        isOpen={activeModal === 'status'}
        onClose={handleModalClose}
        prospectId={selectedProspect || ''}
        onComplete={refreshProspects}
      />
      <ViewCallNotesModal
        isOpen={activeModal === 'viewNotes'}
        onClose={handleModalClose}
        prospectId={selectedProspect || ''}
      />
      <AddProspectModal
        isOpen={addProspectModalOpen}
        onClose={() => setAddProspectModalOpen(false)}
        onComplete={refreshProspects}
      />
    </div>
  );
};

export default ProspectTable;
