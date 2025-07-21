
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { useCRM } from '@/lib/crm/CRMContext';
import CRMAddCampaignModal from './CRMAddCampaignModal';

const CRMCampaignTabs = () => {
  const { campaigns, currentCampaign, setCurrentCampaign } = useCRM();
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
      {/* Desktop Tabs */}
      <div className="hidden md:block">
        <Tabs 
          value={currentCampaign?.crm_id || ''} 
          onValueChange={(value) => {
            const campaign = campaigns.find(c => c.crm_id === value);
            if (campaign) setCurrentCampaign(campaign);
          }}
        >
          <TabsList>
            {campaigns.map(campaign => (
              <TabsTrigger key={campaign.crm_id} value={campaign.crm_id}>
                {campaign.crm_name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Mobile Dropdown */}
      <div className="md:hidden">
        <Select 
          value={currentCampaign?.crm_id || ''} 
          onValueChange={(value) => {
            const campaign = campaigns.find(c => c.crm_id === value);
            if (campaign) setCurrentCampaign(campaign);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a campaign" />
          </SelectTrigger>
          <SelectContent>
            {campaigns.map(campaign => (
              <SelectItem key={campaign.crm_id} value={campaign.crm_id}>
                {campaign.crm_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button onClick={() => setShowAddModal(true)} className="flex items-center gap-2">
        <Plus className="h-4 w-4" />
        New Campaign
      </Button>

      <CRMAddCampaignModal 
        open={showAddModal} 
        onOpenChange={setShowAddModal}
      />
    </div>
  );
};

export default CRMCampaignTabs;
