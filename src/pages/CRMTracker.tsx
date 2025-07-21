
import React from 'react';
import { CRMProvider } from '@/lib/crm/CRMContext';
import CRMCampaignTabs from '@/components/crm/CRMCampaignTabs';
import CRMCampaignSummary from '@/components/crm/CRMCampaignSummary';
import CRMLeadsTable from '@/components/crm/CRMLeadsTable';
import CRMLeadSheetUploader from '@/components/crm/CRMLeadSheetUploader';

const CRMTracker = () => {
  return (
    <CRMProvider>
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">CRM Campaign Tracker</h1>
            <p className="text-muted-foreground mt-2">Manage your campaigns and track leads</p>
          </div>

          <div className="space-y-6">
            <CRMCampaignTabs />
            <CRMCampaignSummary />
            <CRMLeadSheetUploader />
            <CRMLeadsTable />
          </div>
        </div>
      </div>
    </CRMProvider>
  );
};

export default CRMTracker;
