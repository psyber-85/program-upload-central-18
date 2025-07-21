
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCRM } from '@/lib/crm/CRMContext';
import { TrendingUp, Users, DollarSign, Target } from 'lucide-react';

const CRMCampaignSummary = () => {
  const { state } = useCRM();
  const { currentCampaign, leads } = state;

  if (!currentCampaign) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Campaign Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Select a campaign to view summary metrics</p>
        </CardContent>
      </Card>
    );
  }

  const totalLeads = leads.length;
  const totalPotentialDeal = leads.reduce((sum, lead) => sum + lead.crm_potentialDealSize, 0);
  const totalConfirmedDeal = leads.reduce((sum, lead) => sum + lead.crm_confirmedDealSize, 0);
  const successfulLeads = leads.filter(lead => lead.crm_status === 'Success').length;
  const conversionRate = totalLeads > 0 ? (successfulLeads / totalLeads) * 100 : 0;
  
  const scoreMap = { A: 5, B: 4, C: 3, D: 2, E: 1 };
  const avgScore = totalLeads > 0 
    ? leads.reduce((sum, lead) => sum + scoreMap[lead.crm_leadScore], 0) / totalLeads 
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          {currentCampaign.crm_name} - Campaign Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Leads</p>
                <p className="text-2xl font-bold text-blue-900">{totalLeads}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Potential Deal Size</p>
                <p className="text-2xl font-bold text-green-900">
                  RM {totalPotentialDeal.toLocaleString()}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Confirmed Deal Size</p>
                <p className="text-2xl font-bold text-purple-900">
                  RM {totalConfirmedDeal.toLocaleString()}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </div>
          
          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Conversion Rate</p>
                <p className="text-2xl font-bold text-orange-900">{conversionRate.toFixed(1)}%</p>
                <p className="text-xs text-orange-600">Avg Score: {avgScore.toFixed(1)}</p>
              </div>
              <Target className="h-8 w-8 text-orange-500" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CRMCampaignSummary;
