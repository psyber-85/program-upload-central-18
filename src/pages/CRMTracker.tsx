
import React from 'react';
import { CrmProvider } from '@/lib/crm/CRMContext';
import CRMCampaignTabs from '@/components/crm/CRMCampaignTabs';
import CRMCampaignSummary from '@/components/crm/CRMCampaignSummary';
import CRMLeadsTable from '@/components/crm/CRMLeadsTable';
import CRMLeadSheetUploader from '@/components/crm/CRMLeadSheetUploader';

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
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <CRMLeadsTable />
            </div>
            <div className="lg:col-span-1">
              <CRMLeadSheetUploader />
            </div>
          </div>
        </div>
      </div>
    </CrmProvider>
  );
};

export default CRMTracker;
