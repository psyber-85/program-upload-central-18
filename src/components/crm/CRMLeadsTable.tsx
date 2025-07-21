
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, ArrowUpDown, Phone, Mail, Calendar } from 'lucide-react';
import { useCRM } from '../../lib/crm/CRMContext';
import { CRMContactButton } from './CRMContactButton';
import { CRMActivityHistory } from './CRMActivityHistory';
import { CRMMobileLeadCard } from './CRMMobileLeadCard';
import { MALAYSIAN_STATES, LEAD_SCORES, LEAD_STATUSES } from '../../lib/crm/types';
import { updateCrmLeadField } from '../../lib/crm/placeholderFunctions';

export const CRMLeadsTable = () => {
  const { leads, activeCampaignId, updateLead } = useCRM();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('crm_name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [isMobileView, setIsMobileView] = useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const campaignLeads = leads.filter(lead => lead.crm_campaignId === activeCampaignId);

  const filteredLeads = campaignLeads.filter(lead => {
    const searchLower = searchTerm.toLowerCase();
    return (
      lead.crm_name.toLowerCase().includes(searchLower) ||
      lead.crm_org.toLowerCase().includes(searchLower) ||
      lead.crm_jobRole.toLowerCase().includes(searchLower) ||
      lead.crm_state.toLowerCase().includes(searchLower)
    );
  });

  const sortedLeads = [...filteredLeads].sort((a, b) => {
    const aValue = a[sortField as keyof typeof a];
    const bValue = b[sortField as keyof typeof b];
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleFieldUpdate = async (leadId: string, field: string, value: any) => {
    try {
      await updateCrmLeadField(leadId, field as any, value);
      updateLead(leadId, { [field]: value });
    } catch (error) {
      console.error('Error updating lead:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      'Success': 'bg-green-100 text-green-800',
      'Lost': 'bg-red-100 text-red-800',
      'Future': 'bg-yellow-100 text-yellow-800'
    };
    return variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800';
  };

  const getScoreBadge = (score: string) => {
    const variants = {
      'A': 'bg-green-100 text-green-800',
      'B': 'bg-blue-100 text-blue-800',
      'C': 'bg-yellow-100 text-yellow-800',
      'D': 'bg-orange-100 text-orange-800',
      'E': 'bg-red-100 text-red-800'
    };
    return variants[score as keyof typeof variants] || 'bg-gray-100 text-gray-800';
  };

  if (!activeCampaignId) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Select a campaign to view leads</p>
      </div>
    );
  }

  if (isMobileView) {
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="space-y-3">
          {sortedLeads.map((lead) => (
            <CRMMobileLeadCard
              key={lead.crm_id}
              lead={lead}
              onUpdate={handleFieldUpdate}
            />
          ))}
        </div>
        
        {sortedLeads.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No leads found</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search leads..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="cursor-pointer" onClick={() => handleSort('crm_name')}>
                <div className="flex items-center space-x-1">
                  <span>Name</span>
                  <ArrowUpDown className="h-4 w-4" />
                </div>
              </TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Job Role</TableHead>
              <TableHead>Organization</TableHead>
              <TableHead>State</TableHead>
              <TableHead>Lead Score</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Deal Size</TableHead>
              <TableHead>Last Contact</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedLeads.map((lead) => (
              <TableRow key={lead.crm_id}>
                <TableCell className="font-medium">{lead.crm_name}</TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-1">
                      <Phone className="h-3 w-3 text-gray-400" />
                      <span className="text-sm">{lead.crm_number}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{lead.crm_jobRole}</TableCell>
                <TableCell>{lead.crm_org}</TableCell>
                <TableCell>
                  <Select
                    value={lead.crm_state}
                    onValueChange={(value) => handleFieldUpdate(lead.crm_id, 'crm_state', value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MALAYSIAN_STATES.map((state) => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Select
                    value={lead.crm_leadScore}
                    onValueChange={(value) => handleFieldUpdate(lead.crm_id, 'crm_leadScore', value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LEAD_SCORES.map((score) => (
                        <SelectItem key={score} value={score}>
                          {score}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Select
                    value={lead.crm_status}
                    onValueChange={(value) => handleFieldUpdate(lead.crm_id, 'crm_status', value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LEAD_STATUSES.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="text-sm">
                      Potential: RM {lead.crm_potentialDealSize.toLocaleString()}
                    </div>
                    <div className="text-sm text-green-600">
                      Confirmed: RM {lead.crm_confirmedDealSize.toLocaleString()}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {lead.crm_lastContacted ? (
                    <div className="text-sm">
                      {new Date(lead.crm_lastContacted).toLocaleDateString()}
                    </div>
                  ) : (
                    <span className="text-gray-400">Never</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <CRMContactButton lead={lead} />
                    <CRMActivityHistory leadId={lead.crm_id} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {sortedLeads.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No leads found for this campaign</p>
        </div>
      )}
    </div>
  );
};
