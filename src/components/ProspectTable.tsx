
import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Phone, Mail, User, Building, AlertCircle } from 'lucide-react';
import LogCallModal from './LogCallModal';
import AddHRContactModal from './AddHRContactModal';
import NotifyHRModal from './NotifyHRModal';
import UpdateStatusModal from './UpdateStatusModal';

interface Prospect {
  id: string;
  programme: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  jobRole: string;
  lastCall?: string;
  hrContact?: {
    name: string;
    email: string;
    emailSent?: string;
  };
  registrationStatus: 'Pending' | 'Approved' | 'Rejected' | 'Postponed' | 'On Hold';
}

const ProspectTable = () => {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [selectedProspect, setSelectedProspect] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<string | null>(null);

  useEffect(() => {
    // TODO: fetch('/api/prospects')
    fetch('/api/prospects')
      .then(r => r.json())
      .then(setProspects)
      .catch(console.error);
  }, []);

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
    // TODO: Re-fetch prospects data
    console.log('Refreshing prospects...');
  };

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
            {prospects.map((prospect) => (
              <TableRow key={prospect.id}>
                <TableCell className="font-medium">{prospect.programme}</TableCell>
                <TableCell>{prospect.name}</TableCell>
                <TableCell className="hidden sm:table-cell">{prospect.email}</TableCell>
                <TableCell className="hidden md:table-cell">{prospect.phone}</TableCell>
                <TableCell className="hidden lg:table-cell">{prospect.company}</TableCell>
                <TableCell className="hidden lg:table-cell">{prospect.jobRole}</TableCell>
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
                  {prospect.hrContact?.emailSent ? (
                    <div className="flex items-center gap-1">
                      <span className="text-green-600">✅</span>
                      <span className="text-xs text-gray-500">
                        {new Date(prospect.hrContact.emailSent).toLocaleDateString()}
                      </span>
                    </div>
                  ) : '—'}
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(prospect.registrationStatus)}>
                    {prospect.registrationStatus}
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
            ))}
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
