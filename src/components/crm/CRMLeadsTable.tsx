
import React, { useState, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, Plus, ArrowUpDown } from 'lucide-react';
import { useCRM } from '@/lib/crm/CRMContext';
import { MALAYSIAN_STATES } from '@/lib/crm/types';
import CRMAddLeadModal from './CRMAddLeadModal';
import CRMContactButton from './CRMContactButton';
import CRMActivityHistory from './CRMActivityHistory';
import CRMMobileLeadCard from './CRMMobileLeadCard';

const CRMLeadsTable = () => {
  const { leads, searchTerm, setSearchTerm, updateLead } = useCRM();
  const [showAddModal, setShowAddModal] = useState(false);
  const [sortField, setSortField] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const filteredAndSortedLeads = useMemo(() => {
    let filtered = leads.filter(lead => 
      lead.crm_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.crm_org.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.crm_jobRole.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.crm_state.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (sortField) {
      filtered.sort((a, b) => {
        const aValue = (a as any)[sortField];
        const bValue = (b as any)[sortField];
        
        if (sortDirection === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });
    }

    return filtered;
  }, [leads, searchTerm, sortField, sortDirection]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleFieldUpdate = async (leadId: string, field: string, value: any) => {
    await updateLead(leadId, field, value);
  };

  const toggleExpandedRow = (leadId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(leadId)) {
      newExpanded.delete(leadId);
    } else {
      newExpanded.add(leadId);
    }
    setExpandedRows(newExpanded);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search leads..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Button onClick={() => setShowAddModal(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Lead
        </Button>
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="cursor-pointer" onClick={() => handleSort('crm_name')}>
                Name <ArrowUpDown className="ml-1 h-3 w-3 inline" />
              </TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Organization</TableHead>
              <TableHead>State</TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('crm_potentialDealSize')}>
                Potential Deal <ArrowUpDown className="ml-1 h-3 w-3 inline" />
              </TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedLeads.map((lead) => (
              <React.Fragment key={lead.crm_id}>
                <TableRow>
                  <TableCell>
                    <div>
                      <Input
                        value={lead.crm_name}
                        onChange={(e) => handleFieldUpdate(lead.crm_id, 'crm_name', e.target.value)}
                        className="border-none p-0 h-auto font-medium"
                      />
                      <Input
                        value={lead.crm_jobRole}
                        onChange={(e) => handleFieldUpdate(lead.crm_id, 'crm_jobRole', e.target.value)}
                        className="border-none p-0 h-auto text-sm text-muted-foreground"
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Input
                      value={lead.crm_number}
                      onChange={(e) => handleFieldUpdate(lead.crm_id, 'crm_number', e.target.value)}
                      className="border-none p-0 h-auto"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={lead.crm_org}
                      onChange={(e) => handleFieldUpdate(lead.crm_id, 'crm_org', e.target.value)}
                      className="border-none p-0 h-auto"
                    />
                  </TableCell>
                  <TableCell>
                    <Select
                      value={lead.crm_state}
                      onValueChange={(value) => handleFieldUpdate(lead.crm_id, 'crm_state', value)}
                    >
                      <SelectTrigger className="border-none p-0 h-auto">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {MALAYSIAN_STATES.map(state => (
                          <SelectItem key={state} value={state}>{state}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={lead.crm_potentialDealSize}
                      onChange={(e) => handleFieldUpdate(lead.crm_id, 'crm_potentialDealSize', Number(e.target.value))}
                      className="border-none p-0 h-auto"
                    />
                  </TableCell>
                  <TableCell>
                    <Select
                      value={lead.crm_leadScore}
                      onValueChange={(value) => handleFieldUpdate(lead.crm_id, 'crm_leadScore', value)}
                    >
                      <SelectTrigger className="border-none p-0 h-auto w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {['A', 'B', 'C', 'D', 'E'].map(score => (
                          <SelectItem key={score} value={score}>{score}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={lead.crm_status}
                      onValueChange={(value) => handleFieldUpdate(lead.crm_id, 'crm_status', value)}
                    >
                      <SelectTrigger className="border-none p-0 h-auto">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {['Success', 'Lost', 'Future'].map(status => (
                          <SelectItem key={status} value={status}>{status}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <CRMContactButton lead={lead} />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleExpandedRow(lead.crm_id)}
                      >
                        {expandedRows.has(lead.crm_id) ? 'Hide' : 'History'}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
                {expandedRows.has(lead.crm_id) && (
                  <TableRow>
                    <TableCell colSpan={8}>
                      <CRMActivityHistory leadId={lead.crm_id} />
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden space-y-4">
        {filteredAndSortedLeads.map((lead) => (
          <CRMMobileLeadCard key={lead.crm_id} lead={lead} />
        ))}
      </div>

      <CRMAddLeadModal 
        open={showAddModal} 
        onOpenChange={setShowAddModal}
      />
    </div>
  );
};

export default CRMLeadsTable;
