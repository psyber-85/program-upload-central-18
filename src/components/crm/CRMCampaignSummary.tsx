
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCrm } from '@/lib/crm/CRMContext';
import { DollarSign, Users, Target, TrendingUp } from 'lucide-react';

const CRMCampaignSummary = () => {
  const { state } = useCrm();
  const { leads } = state;

  const totalLeads = leads.length;
  const totalPotential = leads.reduce((sum, lead) => sum + lead.crm_potentialDealSize, 0);
  const totalConfirmed = leads.reduce((sum, lead) => sum + lead.crm_confirmedDealSize, 0);
  const successfulLeads = leads.filter(lead => lead.crm_status === 'Success').length;
  const conversionRate = totalLeads > 0 ? (successfulLeads / totalLeads) * 100 : 0;
  
  const avgLeadScore = leads.length > 0 
    ? leads.reduce((sum, lead) => {
        const scoreMap = { A: 5, B: 4, C: 3, D: 2, E: 1 };
        return sum + scoreMap[lead.crm_leadScore];
      }, 0) / leads.length
    : 0;

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-MY', { 
      style: 'currency', 
      currency: 'MYR',
      minimumFractionDigits: 0 
    }).format(amount);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalLeads}</div>
          <p className="text-xs text-muted-foreground">
            Active leads in campaign
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Potential Value</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalPotential)}</div>
          <p className="text-xs text-muted-foreground">
            Total potential deal size
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Confirmed Value</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalConfirmed)}</div>
          <p className="text-xs text-muted-foreground">
            Confirmed deal value
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{conversionRate.toFixed(1)}%</div>
          <p className="text-xs text-muted-foreground">
            Success rate (Avg Score: {avgLeadScore.toFixed(1)}/5)
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default CRMCampaignSummary;
