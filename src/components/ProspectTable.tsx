import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Phone, Mail, User, Building, AlertCircle, Search, ChevronUp, ChevronDown, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import LogCallModal from './LogCallModal';
import AddHRContactModal from './AddHRContactModal';
import NotifyHRModal from './NotifyHRModal';
import UpdateStatusModal from './UpdateStatusModal';
import ViewCallNotesModal from './ViewCallNotesModal';

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
  payment_status: string | null;
  product_type: string | null;
  registration_status: 'Pending' | 'Approved' | 'Rejected' | 'Postponed' | 'On Hold';
  lastCall?: string;
  hrContact?: HRContact;
  hasCallNotes?: boolean;
}

type SortField = 'name' | 'email' | 'org' | 'role' | 'program' | 'registration_status' | 'lastCall';
type SortDirection = 'asc' | 'desc';

const ProspectTable = () => {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [filteredProspects, setFilteredProspects] = useState<Prospect[]>([]);
  const [programs, setPrograms] = useState<{[key: string]: string}>({});
  const [selectedProspect, setSelectedProspect] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [prospectsPerPage] = useState(10);
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
    let filtered = prospects.filter(prospect => 
      prospect.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prospect.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prospect.program.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (prospect.org && prospect.org.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (prospect.role && prospect.role.toLowerCase().includes(searchTerm.toLowerCase()))
    );

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
    setCurrentPage(1); // Reset to first page when filtering
  }, [searchTerm, prospects, sortField, sortDirection]);

  const fetchProspects = async () => {
    try {
      setLoading(true);
      
      // Fetch programs first
      const { data: programsData, error: programsError } = await supabase
        .from('programs')
        .select('id, title');
      
      if (programsError) throw programsError;
      
      const programsMap = programsData?.reduce((acc, program) => {
        acc[program.id] = program.title;
        return acc;
      }, {} as {[key: string]: string}) || {};
      
      setPrograms(programsMap);

      // Fetch prospects with related data
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
          payment_status: prospect.payment_status,
          product_type: prospect.product_type,
          registration_status: prospect.registration_status as Prospect['registration_status'],
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

  // Pagination calculations
  const totalPages = Math.ceil(filteredProspects.length / prospectsPerPage);
  const startIndex = (currentPage - 1) * prospectsPerPage;
  const endIndex = startIndex + prospectsPerPage;
  const currentProspects = filteredProspects.slice(startIndex, endIndex);

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
      {/* Search Bar */}
      <div className="p-4 border-b">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search prospects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="mt-2 text-sm text-gray-600">
          Showing {filteredProspects.length} of {prospects.length} prospects
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
              <TableHead className="hidden sm:table-cell cursor-pointer" onClick={() => handleSort('email')}>
                <div className="flex items-center gap-1">
                  Email {getSortIcon('email')}
                </div>
              </TableHead>
              <TableHead className="hidden md:table-cell">Phone</TableHead>
              <TableHead className="hidden lg:table-cell cursor-pointer" onClick={() => handleSort('org')}>
                <div className="flex items-center gap-1">
                  Company {getSortIcon('org')}
                </div>
              </TableHead>
              <TableHead className="hidden lg:table-cell cursor-pointer" onClick={() => handleSort('role')}>
                <div className="flex items-center gap-1">
                  Job Role {getSortIcon('role')}
                </div>
              </TableHead>
              <TableHead className="hidden md:table-cell cursor-pointer" onClick={() => handleSort('lastCall')}>
                <div className="flex items-center gap-1">
                  Last Call {getSortIcon('lastCall')}
                </div>
              </TableHead>
              <TableHead className="hidden lg:table-cell">HR Contact</TableHead>
              <TableHead className="hidden lg:table-cell">HR Email</TableHead>
              <TableHead className="hidden md:table-cell">HR Email Sent</TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('registration_status')}>
                <div className="flex items-center gap-1">
                  Status {getSortIcon('registration_status')}
                </div>
              </TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentProspects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={12} className="text-center py-6">
                  {searchTerm ? 'No prospects found matching your search.' : 'No prospects found. Add some prospects to get started.'}
                </TableCell>
              </TableRow>
            ) : (
              currentProspects.map((prospect) => (
                <TableRow key={prospect.id}>
                  <TableCell className="font-medium">{prospect.program}</TableCell>
                  <TableCell>{prospect.name}</TableCell>
                  <TableCell className="hidden sm:table-cell">{prospect.email}</TableCell>
                  <TableCell className="hidden md:table-cell">{prospect.phone || '—'}</TableCell>
                  <TableCell className="hidden lg:table-cell">{prospect.org || '—'}</TableCell>
                  <TableCell className="hidden lg:table-cell">{prospect.role || '—'}</TableCell>
                  <TableCell className="hidden md:table-cell">
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
                  <TableCell className="hidden lg:table-cell">
                    {prospect.hrContact?.name || '—'}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {prospect.hrContact?.email || '—'}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {prospect.hrContact?.email_sent_at ? (
                      <div className="flex items-center gap-1">
                        <span className="text-green-600">✅</span>
                        <span className="text-xs text-gray-500">
                          {new Date(prospect.hrContact.email_sent_at).toLocaleDateString()}
                        </span>
                      </div>
                    ) : '—'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(prospect.registration_status)}>
                      {prospect.registration_status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col sm:flex-row gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleModalOpen('call', prospect.id)}
                        className="text-xs"
                      >
                        <Phone className="w-3 h-3" />
                        <span className="hidden sm:inline ml-1">Call</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleModalOpen('hr', prospect.id)}
                        className="text-xs"
                      >
                        <User className="w-3 h-3" />
                        <span className="hidden sm:inline ml-1">
                          {prospect.hrContact?.name ? 'Edit HR' : 'Add HR'}
                        </span>
                      </Button>
                      {prospect.hrContact?.email && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleModalOpen('notify', prospect.id)}
                          className="text-xs"
                        >
                          <Mail className="w-3 h-3" />
                          <span className="hidden sm:inline ml-1">Notify</span>
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleModalOpen('status', prospect.id)}
                        className="text-xs"
                      >
                        <AlertCircle className="w-3 h-3" />
                        <span className="hidden sm:inline ml-1">Status</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
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
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    onClick={() => setCurrentPage(page)}
                    isActive={currentPage === page}
                    className="cursor-pointer"
                  >
                    {page}
                  </PaginationLink>
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
    </div>
  );
};

export default ProspectTable;
