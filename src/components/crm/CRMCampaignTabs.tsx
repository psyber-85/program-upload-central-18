
import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useCrm } from '@/lib/crm/CRMContext';
import CRMAddCampaignModal from './CRMAddCampaignModal';

const CRMCampaignTabs = () => {
  const { state, dispatch, loadLeads } = useCrm();
  const { campaigns, activeCampaignId } = state;
  const [showAddModal, setShowAddModal] = useState(false);

  const handleTabChange = async (campaignId: string) => {
    dispatch({ type: 'SET_ACTIVE_CAMPAIGN', payload: campaignId });
    await loadLeads(campaignId);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Campaign Tabs</h2>
        <Button onClick={() => setShowAddModal(true)} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          New Campaign
        </Button>
      </div>

      {campaigns.length > 0 ? (
        <Tabs value={activeCampaignId || ''} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 lg:grid-cols-4">
            {campaigns.map((campaign) => (
              <TabsTrigger key={campaign.crm_id} value={campaign.crm_id} className="text-sm">
                {campaign.crm_name}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {campaigns.map((campaign) => (
            <TabsContent key={campaign.crm_id} value={campaign.crm_id} className="mt-4">
              <div className="space-y-2">
                <h3 className="font-medium">{campaign.crm_name}</h3>
                {campaign.crm_objective && (
                  <p className="text-sm text-muted-foreground">{campaign.crm_objective}</p>
                )}
                {(campaign.crm_startDate || campaign.crm_endDate) && (
                  <div className="text-sm text-muted-foreground">
                    {campaign.crm_startDate && `Start: ${campaign.crm_startDate}`}
                    {campaign.crm_startDate && campaign.crm_endDate && ' • '}
                    {campaign.crm_endDate && `End: ${campaign.crm_endDate}`}
                  </div>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">No campaigns found. Create your first campaign to get started.</p>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Campaign
          </Button>
        </div>
      )}

      <CRMAddCampaignModal 
        open={showAddModal} 
        onOpenChange={setShowAddModal}
      />
    </div>
  );
};

export default CRMCampaignTabs;
