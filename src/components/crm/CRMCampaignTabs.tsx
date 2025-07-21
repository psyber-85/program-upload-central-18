
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useCRM } from '@/lib/crm/CRMContext';
import CRMCampaignModal from './CRMCampaignModal';
import CRMLeadsTable from './CRMLeadsTable';
import CRMLeadSheetUploader from './CRMLeadSheetUploader';

const CRMCampaignTabs = () => {
  const { state, loadLeads, setCurrentCampaign } = useCRM();
  const { campaigns, currentCampaign } = state;
  const [showNewCampaignModal, setShowNewCampaignModal] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('');

  useEffect(() => {
    if (campaigns.length > 0 && !activeTab) {
      setActiveTab(campaigns[0].crm_id);
      setCurrentCampaign(campaigns[0]);
      loadLeads(campaigns[0].crm_id);
    }
  }, [campaigns, activeTab, loadLeads, setCurrentCampaign]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    const campaign = campaigns.find(c => c.crm_id === tabId);
    if (campaign) {
      setCurrentCampaign(campaign);
      loadLeads(tabId);
    }
  };

  if (campaigns.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-4">No campaigns found. Create your first campaign to get started.</p>
        <Button onClick={() => setShowNewCampaignModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Campaign
        </Button>
        <CRMCampaignModal 
          isOpen={showNewCampaignModal} 
          onClose={() => setShowNewCampaignModal(false)} 
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Campaigns</h2>
        <Button onClick={() => setShowNewCampaignModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Campaign
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${campaigns.length}, 1fr)` }}>
          {campaigns.map((campaign) => (
            <TabsTrigger key={campaign.crm_id} value={campaign.crm_id} className="text-sm">
              {campaign.crm_name}
            </TabsTrigger>
          ))}
        </TabsList>

        {campaigns.map((campaign) => (
          <TabsContent key={campaign.crm_id} value={campaign.crm_id} className="mt-4">
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-lg border">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Objective:</span> {campaign.crm_objective || 'N/A'}
                  </div>
                  <div>
                    <span className="font-medium">Duration:</span> {campaign.crm_startDate} to {campaign.crm_endDate}
                  </div>
                  {campaign.crm_notes && (
                    <div className="md:col-span-2">
                      <span className="font-medium">Notes:</span> {campaign.crm_notes}
                    </div>
                  )}
                </div>
              </div>

              <CRMLeadSheetUploader campaignId={campaign.crm_id} />
              <CRMLeadsTable campaignId={campaign.crm_id} />
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <CRMCampaignModal 
        isOpen={showNewCampaignModal} 
        onClose={() => setShowNewCampaignModal(false)} 
      />
    </div>
  );
};

export default CRMCampaignTabs;
