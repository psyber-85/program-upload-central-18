
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Phone, Calendar, TrendingUp, User, Eye } from 'lucide-react';
import { useCRM } from '@/lib/crm/CRMContext';
import { format } from 'date-fns';
import CRMAddLeadModal from './CRMAddLeadModal';
import CRMContactButton from './CRMContactButton';
import CRMActivityHistory from './CRMActivityHistory';
import CRMMobileLeadCard from './CRMMobileLeadCard';

interface CRMLeadsTableProps {
  campaignId: string;
}

const CRMLeadsTable: React.FC<CRMLeadsTableProps> = ({ campaignId }) => {
  const { state } = useCRM();
  const { leads, loading } = state;
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [showActivities, setShowActivities] = useState(false);

  const filteredLeads = leads.filter(lead => {
    const searchLower = searchTerm.toLowerCase();
    return (
      lead.crm_name.toLowerCase().includes(searchLower) ||
      lead.crm_org.toLowerCase().includes(searchLower) ||
      lead.crm_jobRole.toLowerCase().includes(searchLower) ||
      lead.crm_state.toLowerCase().includes(searchLower)
    );
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Success': return 'bg-green-100 text-green-800';
      case 'Lost': return 'bg-red-100 text-red-800';
      case 'Future': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreColor = (score: string) => {
    switch (score) {
      case 'A': return 'bg-green-100 text-green-800';
      case 'B': return 'bg-blue-100 text-blue-800';
      case 'C': return 'bg-yellow-100 text-yellow-800';
      case 'D': return 'bg-orange-100 text-orange-800';
      case 'E': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading leads...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Campaign Leads ({filteredLeads.length})
          </CardTitle>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search leads..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full sm:w-64"
              />
            </div>
            <Button onClick={() => setShowAddLeadModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Lead
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredLeads.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No leads found. Add your first lead to get started.
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Organization</TableHead>
                    <TableHead>State</TableHead>
                    <TableHead>Last Contact</TableHead>
                    <TableHead>Follow Up</TableHead>
                    <TableHead>Deal Size</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeads.map((lead) => (
                    <TableRow key={lead.crm_id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{lead.crm_name}</div>
                          <div className="text-sm text-gray-500">{lead.crm_jobRole}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {lead.crm_number}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{lead.crm_org}</div>
                          <div className="text-sm text-gray-500">{lead.crm_industry}</div>
                        </div>
                      </TableCell>
                      <TableCell>{lead.crm_state}</TableCell>
                      <TableCell>
                        {lead.crm_lastContacted ? (
                          <div className="text-sm">
                            {format(new Date(lead.crm_lastContacted), 'MMM dd, yyyy')}
                          </div>
                        ) : (
                          <span className="text-gray-400">Never</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {lead.crm_nextFollowUp ? (
                          <div className="flex items-center gap-1 text-sm">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(lead.crm_nextFollowUp), 'MMM dd')}
                          </div>
                        ) : (
                          <span className="text-gray-400">Not set</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="flex items-center gap-1 font-medium">
                            <TrendingUp className="h-3 w-3" />
                            RM {lead.crm_potentialDealSize.toLocaleString()}
                          </div>
                          {lead.crm_confirmedDealSize > 0 && (
                            <div className="text-green-600">
                              RM {lead.crm_confirmedDealSize.toLocaleString()}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getScoreColor(lead.crm_leadScore)}>
                          {lead.crm_leadScore}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(lead.crm_status)}>
                          {lead.crm_status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <CRMContactButton leadId={lead.crm_id} />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedLeadId(lead.crm_id);
                              setShowActivities(true);
                            }}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden space-y-4">
              {filteredLeads.map((lead) => (
                <CRMMobileLeadCard key={lead.crm_id} lead={lead} />
              ))}
            </div>
          </>
        )}
      </CardContent>

      <CRMAddLeadModal 
        isOpen={showAddLeadModal} 
        onClose={() => setShowAddLeadModal(false)}
        campaignId={campaignId}
      />

      <CRMActivityHistory
        isOpen={showActivities}
        onClose={() => setShowActivities(false)}
        leadId={selectedLeadId}
      />
    </Card>
  );
};

export default CRMLeadsTable;
