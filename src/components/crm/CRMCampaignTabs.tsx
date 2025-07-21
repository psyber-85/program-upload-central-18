
import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCRM } from '../../lib/crm/CRMContext';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';

export const CRMCampaignTabs = () => {
  const { campaigns, activeCampaignId, setActiveCampaignId } = useCRM();
  const [isMobileView, setIsMobileView] = useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleCampaignChange = (campaignId: string) => {
    setActiveCampaignId(campaignId);
  };

  if (campaigns.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No campaigns found. Create your first campaign to get started.</p>
      </div>
    );
  }

  if (isMobileView) {
    return (
      <div className="w-full">
        <Select value={activeCampaignId || ''} onValueChange={handleCampaignChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a campaign" />
          </SelectTrigger>
          <SelectContent>
            {campaigns.map((campaign) => (
              <SelectItem key={campaign.crm_id} value={campaign.crm_id}>
                {campaign.crm_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  return (
    <Tabs value={activeCampaignId || ''} onValueChange={handleCampaignChange} className="w-full">
      <TabsList className="grid w-full grid-cols-auto">
        {campaigns.map((campaign) => (
          <TabsTrigger
            key={campaign.crm_id}
            value={campaign.crm_id}
            className="text-sm"
          >
            {campaign.crm_name}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
};
