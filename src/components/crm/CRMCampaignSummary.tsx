
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCRM } from '../../lib/crm/CRMContext';
import { TrendingUp, Users, DollarSign, Target } from 'lucide-react';

export const CRMCampaignSummary = () => {
  const { leads, activeCampaignId } = useCRM();

  const campaignLeads = leads.filter(lead => lead.crm_campaignId === activeCampaignId);

  const totalLeads = campaignLeads.length;
  const totalPotentialDeals = campaignLeads.reduce((sum, lead) => sum + lead.crm_potentialDealSize, 0);
  const totalConfirmedDeals = campaignLeads.reduce((sum, lead) => sum + lead.crm_confirmedDealSize, 0);
  const successfulLeads = campaignLeads.filter(lead => lead.crm_status === 'Success').length;
  const conversionRate = totalLeads > 0 ? (successfulLeads / totalLeads * 100).toFixed(1) : '0';
  
  // Calculate average lead score (A=5, B=4, C=3, D=2, E=1)
  const scoreMap = { A: 5, B: 4, C: 3, D: 2, E: 1 };
  const avgScore = totalLeads > 0 
    ? (campaignLeads.reduce((sum, lead) => sum + scoreMap[lead.crm_leadScore], 0) / totalLeads).toFixed(1)
    : '0';

  if (!activeCampaignId) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-gray-500 text-center">Select a campaign to view summary</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalLeads}</div>
          <p className="text-xs text-muted-foreground">Active prospects</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Potential Deals</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">RM {totalPotentialDeals.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">Total pipeline value</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Confirmed Deals</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">RM {totalConfirmedDeals.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">Closed business</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{conversionRate}%</div>
          <p className="text-xs text-muted-foreground">Avg Score: {avgScore}/5</p>
        </CardContent>
      </Card>
    </div>
  );
};
