
import React from 'react';
import { CRMProvider } from '@/lib/crm/CRMContext';
import CRMCampaignTabs from '@/components/crm/CRMCampaignTabs';
import CRMCampaignSummary from '@/components/crm/CRMCampaignSummary';

const CRMTracker = () => {
  return (
    <CRMProvider>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-screen-xl mx-auto p-4 sm:p-6">
          <h1 className="text-2xl md:text-3xl font-semibold mb-6">CRM Campaign Tracker</h1>
          
          {/* Campaign Summary Dashboard */}
          <div className="mb-6">
            <CRMCampaignSummary />
          </div>
          
          {/* Campaign Tabs with Leads */}
          <CRMCampaignTabs />
        </div>
      </div>
    </CRMProvider>
  );
};

export default CRMTracker;
