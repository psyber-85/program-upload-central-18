
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Phone, Mail, MapPin, Building, User } from 'lucide-react';
import { CRMLead } from '../../lib/crm/types';
import { CRMContactButton } from './CRMContactButton';
import { CRMActivityHistory } from './CRMActivityHistory';

interface CRMMobileLeadCardProps {
  lead: CRMLead;
  onUpdate: (leadId: string, field: string, value: any) => void;
}

export const CRMMobileLeadCard: React.FC<CRMMobileLeadCardProps> = ({ lead, onUpdate }) => {
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

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{lead.crm_name}</CardTitle>
          <div className="flex space-x-2">
            <Badge className={getScoreBadge(lead.crm_leadScore)}>
              {lead.crm_leadScore}
            </Badge>
            <Badge className={getStatusBadge(lead.crm_status)}>
              {lead.crm_status}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Contact Information */}
        <div className="grid grid-cols-1 gap-2">
          <div className="flex items-center space-x-2">
            <Phone className="h-4 w-4 text-gray-400" />
            <span className="text-sm">{lead.crm_number}</span>
          </div>
          <div className="flex items-center space-x-2">
            <User className="h-4 w-4 text-gray-400" />
            <span className="text-sm">{lead.crm_jobRole}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Building className="h-4 w-4 text-gray-400" />
            <span className="text-sm">{lead.crm_org}</span>
          </div>
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4 text-gray-400" />
            <span className="text-sm">{lead.crm_state}</span>
          </div>
        </div>

        {/* Deal Information */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-600">Potential:</span>
              <div className="font-medium">RM {lead.crm_potentialDealSize.toLocaleString()}</div>
            </div>
            <div>
              <span className="text-gray-600">Confirmed:</span>
              <div className="font-medium text-green-600">RM {lead.crm_confirmedDealSize.toLocaleString()}</div>
            </div>
          </div>
        </div>

        {/* Last Contact */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm text-gray-600">Last Contact:</span>
            <div className="text-sm">
              {lead.crm_lastContacted 
                ? new Date(lead.crm_lastContacted).toLocaleDateString()
                : 'Never'
              }
            </div>
          </div>
          <div className="flex space-x-2">
            <CRMContactButton lead={lead} />
            <CRMActivityHistory leadId={lead.crm_id} />
          </div>
        </div>

        {/* Notes */}
        {lead.crm_notes && (
          <div className="text-sm text-gray-600 bg-blue-50 p-2 rounded">
            {lead.crm_notes}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
