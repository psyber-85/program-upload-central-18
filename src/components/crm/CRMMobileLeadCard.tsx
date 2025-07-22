
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Phone, Mail, Building, MapPin } from 'lucide-react';
import { CrmLead } from '@/lib/crm/types';
import CRMContactButton from './CRMContactButton';

interface CRMMobileLeadCardProps {
  lead: CrmLead;
}

const CRMMobileLeadCard: React.FC<CRMMobileLeadCardProps> = ({ lead }) => {
  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-MY', { 
      style: 'currency', 
      currency: 'MYR',
      minimumFractionDigits: 0 
    }).format(amount);

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Success': return 'bg-green-100 text-green-800';
      case 'Lost': return 'bg-red-100 text-red-800';
      case 'Future': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-lg">{lead.crm_name}</h3>
              <p className="text-sm text-muted-foreground">{lead.crm_jobRole}</p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={getScoreColor(lead.crm_leadScore)}>
                {lead.crm_leadScore}
              </Badge>
              <Badge className={getStatusColor(lead.crm_status)}>
                {lead.crm_status}
              </Badge>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{lead.crm_email}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{lead.crm_number}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <Building className="h-4 w-4 text-muted-foreground" />
              <span>{lead.crm_org}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{lead.crm_state}</span>
            </div>
          </div>

          {/* Deal Info */}
          <div className="grid grid-cols-2 gap-4 pt-2 border-t">
            <div>
              <p className="text-xs text-muted-foreground">Potential</p>
              <p className="font-medium">{formatCurrency(lead.crm_potentialDealSize)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Confirmed</p>
              <p className="font-medium">{formatCurrency(lead.crm_confirmedDealSize)}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="text-xs text-muted-foreground">
              Owner: {lead.crm_ownerName}
            </div>
            <CRMContactButton leadId={lead.crm_id} />
          </div>

          {lead.crm_notes && (
            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground mb-1">Notes:</p>
              <p className="text-sm">{lead.crm_notes}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CRMMobileLeadCard;
