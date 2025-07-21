
import React from 'react';
import { CRMProvider } from '../lib/crm/CRMContext';
import { CRMCampaignTabs } from '../components/crm/CRMCampaignTabs';
import { CRMCampaignSummary } from '../components/crm/CRMCampaignSummary';
import { CRMLeadsTable } from '../components/crm/CRMLeadsTable';
import { CRMAddCampaignModal } from '../components/crm/CRMAddCampaignModal';
import { CRMAddLeadModal } from '../components/crm/CRMAddLeadModal';
import { CRMLeadSheetUploader } from '../components/crm/CRMLeadSheetUploader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Upload } from 'lucide-react';

const CRMTracker = () => {
  return (
    <CRMProvider>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">CRM Campaign Tracker</h1>
            <p className="text-gray-600">Manage your leads and track campaign performance</p>
          </div>

          <div className="space-y-6">
            {/* Campaign Tabs */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <CardTitle>Campaigns</CardTitle>
                  <CRMAddCampaignModal />
                </div>
              </CardHeader>
              <CardContent>
                <CRMCampaignTabs />
              </CardContent>
            </Card>

            {/* Campaign Summary */}
            <CRMCampaignSummary />

            {/* Leads Management */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <CardTitle>Leads</CardTitle>
                  <div className="flex gap-2">
                    <CRMLeadSheetUploader />
                    <CRMAddLeadModal />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CRMLeadsTable />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </CRMProvider>
  );
};

export default CRMTracker;
