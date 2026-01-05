import React from 'react';
import { CrmProvider } from '@/lib/crm/CRMContext';
import CRMCampaignTabs from '@/components/crm/CRMCampaignTabs';
import CRMCampaignSummary from '@/components/crm/CRMCampaignSummary';
import CRMLeadsTable from '@/components/crm/CRMLeadsTable';

const CRMTracker = () => {
  return (
    <CrmProvider>
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">CRM Campaign Tracker</h1>
          <p className="text-muted-foreground">
            Manage your marketing campaigns and track leads through the sales pipeline
          </p>
        </div>

        <div className="space-y-6">
          <CRMCampaignTabs />
          
          <CRMCampaignSummary />
          
          <CRMLeadsTable />
        </div>
      </div>
    </CrmProvider>
  );
};

export default CRMTracker;
