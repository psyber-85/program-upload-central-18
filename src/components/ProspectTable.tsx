
import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Phone, Mail, User, Building, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import LogCallModal from './LogCallModal';
import AddHRContactModal from './AddHRContactModal';
import NotifyHRModal from './NotifyHRModal';
import UpdateStatusModal from './UpdateStatusModal';

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
}

const ProspectTable = () => {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [programs, setPrograms] = useState<{[key: string]: string}>({});
  const [selectedProspect, setSelectedProspect] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchProspects();
  }, []);

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
          prospect_calls(call_date),
          hr_contacts(name, email, email_sent_at)
        `)
        .order('created_at', { ascending: false });

      if (prospectsError) throw prospectsError;

      const formattedProspects: Prospect[] = prospectsData?.map(prospect => {
        const lastCall = prospect.prospect_calls?.length > 0 
          ? prospect.prospect_calls.sort((a: any, b: any) => new Date(b.call_date).getTime() - new Date(a.call_date).getTime())[0].call_date
          : undefined;
        
        const hrContact = prospect.hr_contacts?.length > 0 ? prospect.hr_contacts[0] : undefined;

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
          } : undefined
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
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Programme</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="hidden sm:table-cell">Email</TableHead>
              <TableHead className="hidden md:table-cell">Phone</TableHead>
              <TableHead className="hidden lg:table-cell">Company</TableHead>
              <TableHead className="hidden lg:table-cell">Job Role</TableHead>
              <TableHead className="hidden md:table-cell">Last Call</TableHead>
              <TableHead className="hidden lg:table-cell">HR Contact</TableHead>
              <TableHead className="hidden lg:table-cell">HR Email</TableHead>
              <TableHead className="hidden md:table-cell">HR Email Sent</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {prospects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={12} className="text-center py-6">
                  No prospects found. Add some prospects to get started.
                </TableCell>
              </TableRow>
            ) : (
              prospects.map((prospect) => (
                <TableRow key={prospect.id}>
                  <TableCell className="font-medium">{prospect.program}</TableCell>
                  <TableCell>{prospect.name}</TableCell>
                  <TableCell className="hidden sm:table-cell">{prospect.email}</TableCell>
                  <TableCell className="hidden md:table-cell">{prospect.phone || '—'}</TableCell>
                  <TableCell className="hidden lg:table-cell">{prospect.org || '—'}</TableCell>
                  <TableCell className="hidden lg:table-cell">{prospect.role || '—'}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {prospect.lastCall || '—'}
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
    </div>
  );
};

export default ProspectTable;
