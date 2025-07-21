
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Phone, Building, MapPin, Calendar, TrendingUp, Eye, User } from 'lucide-react';
import { CRMLead } from '@/lib/crm/types';
import { format } from 'date-fns';
import CRMContactButton from './CRMContactButton';

interface CRMMobileLeadCardProps {
  lead: CRMLead;
}

const CRMMobileLeadCard: React.FC<CRMMobileLeadCardProps> = ({ lead }) => {
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

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500" />
                <span className="font-medium">{lead.crm_name}</span>
              </div>
              <p className="text-sm text-gray-600">{lead.crm_jobRole}</p>
            </div>
            <div className="flex gap-2">
              <Badge className={getScoreColor(lead.crm_leadScore)}>
                {lead.crm_leadScore}
              </Badge>
              <Badge className={getStatusColor(lead.crm_status)}>
                {lead.crm_status}
              </Badge>
            </div>
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-1 gap-2 text-sm">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-gray-500" />
              <span>{lead.crm_number}</span>
            </div>
            <div className="flex items-center gap-2">
              <Building className="h-4 w-4 text-gray-500" />
              <span>{lead.crm_org} - {lead.crm_industry}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span>{lead.crm_state}</span>
            </div>
          </div>

          {/* Deal Info */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">
                  RM {lead.crm_potentialDealSize.toLocaleString()}
                </span>
              </div>
              {lead.crm_confirmedDealSize > 0 && (
                <div className="text-sm text-green-600 font-medium">
                  Confirmed: RM {lead.crm_confirmedDealSize.toLocaleString()}
                </div>
              )}
            </div>
          </div>

          {/* Dates */}
          <div className="flex justify-between text-sm text-gray-600">
            <div>
              <span className="font-medium">Last Contact:</span>{' '}
              {lead.crm_lastContacted 
                ? format(new Date(lead.crm_lastContacted), 'MMM dd, yyyy')
                : 'Never'
              }
            </div>
            {lead.crm_nextFollowUp && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {format(new Date(lead.crm_nextFollowUp), 'MMM dd')}
              </div>
            )}
          </div>

          {/* Notes */}
          {lead.crm_notes && (
            <div className="bg-blue-50 p-2 rounded text-sm">
              <span className="font-medium">Notes:</span> {lead.crm_notes}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <CRMContactButton leadId={lead.crm_id} />
            <Button variant="outline" size="sm" className="flex-1">
              <Eye className="h-3 w-3 mr-1" />
              History
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CRMMobileLeadCard;
