
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCRM } from '@/lib/crm/CRMContext';

const CRMCampaignSummary = () => {
  const { leads, currentCampaign } = useCRM();

  if (!currentCampaign) return null;

  const totalLeads = leads.length;
  const totalPotentialDeal = leads.reduce((sum, lead) => sum + lead.crm_potentialDealSize, 0);
  const totalConfirmedDeal = leads.reduce((sum, lead) => sum + lead.crm_confirmedDealSize, 0);
  const successfulLeads = leads.filter(lead => lead.crm_status === 'Success').length;
  const conversionRate = totalLeads > 0 ? (successfulLeads / totalLeads) * 100 : 0;
  
  const scoreMap = { A: 5, B: 4, C: 3, D: 2, E: 1 };
  const avgLeadScore = totalLeads > 0 
    ? leads.reduce((sum, lead) => sum + scoreMap[lead.crm_leadScore], 0) / totalLeads 
    : 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-MY', {
      style: 'currency',
      currency: 'MYR'
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Leads</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalLeads}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Potential Deal Size</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalPotentialDeal)}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Confirmed Deal Size</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{formatCurrency(totalConfirmedDeal)}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Conversion Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{conversionRate.toFixed(1)}%</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Avg Lead Score</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{avgLeadScore.toFixed(1)}/5</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CRMCampaignSummary;
