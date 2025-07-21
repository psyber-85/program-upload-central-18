
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CRMLead, MALAYSIAN_STATES } from '@/lib/crm/types';
import { useCRM } from '@/lib/crm/CRMContext';
import CRMContactButton from './CRMContactButton';
import CRMActivityHistory from './CRMActivityHistory';

interface CRMMobileLeadCardProps {
  lead: CRMLead;
}

const CRMMobileLeadCard: React.FC<CRMMobileLeadCardProps> = ({ lead }) => {
  const { updateLead } = useCRM();
  const [showHistory, setShowHistory] = useState(false);

  const handleFieldUpdate = async (field: string, value: any) => {
    await updateLead(lead.crm_id, field, value);
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
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <Input
              value={lead.crm_name}
              onChange={(e) => handleFieldUpdate('crm_name', e.target.value)}
              className="border-none p-0 h-auto font-medium text-lg"
            />
            <Input
              value={lead.crm_jobRole}
              onChange={(e) => handleFieldUpdate('crm_jobRole', e.target.value)}
              className="border-none p-0 h-auto text-sm text-muted-foreground"
            />
          </div>
          <Badge className={getStatusColor(lead.crm_status)}>
            {lead.crm_status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted-foreground">Contact</label>
            <Input
              value={lead.crm_number}
              onChange={(e) => handleFieldUpdate('crm_number', e.target.value)}
              className="h-8"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">State</label>
            <Select
              value={lead.crm_state}
              onValueChange={(value) => handleFieldUpdate('crm_state', value)}
            >
              <SelectTrigger className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MALAYSIAN_STATES.map(state => (
                  <SelectItem key={state} value={state}>{state}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <label className="text-xs text-muted-foreground">Organization</label>
          <Input
            value={lead.crm_org}
            onChange={(e) => handleFieldUpdate('crm_org', e.target.value)}
            className="h-8"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted-foreground">Potential Deal</label>
            <Input
              type="number"
              value={lead.crm_potentialDealSize}
              onChange={(e) => handleFieldUpdate('crm_potentialDealSize', Number(e.target.value))}
              className="h-8"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Lead Score</label>
            <Select
              value={lead.crm_leadScore}
              onValueChange={(value) => handleFieldUpdate('crm_leadScore', value)}
            >
              <SelectTrigger className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {['A', 'B', 'C', 'D', 'E'].map(score => (
                  <SelectItem key={score} value={score}>{score}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-2">
          <CRMContactButton lead={lead} />
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowHistory(!showHistory)}
          >
            {showHistory ? 'Hide History' : 'View History'}
          </Button>
        </div>

        {showHistory && (
          <div className="mt-4">
            <CRMActivityHistory leadId={lead.crm_id} />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CRMMobileLeadCard;
