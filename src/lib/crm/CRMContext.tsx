
import React, { createContext, useContext, useState, useEffect } from 'react';
import { CRMCampaign, CRMLead, CRMLeadActivity } from './types';
import { fetchCrmCampaigns, fetchCrmLeadsByCampaign, fetchCrmActivitiesByLead } from './placeholderFunctions';

interface CRMContextType {
  campaigns: CRMCampaign[];
  leads: CRMLead[];
  activities: CRMLeadActivity[];
  activeCampaignId: string | null;
  loading: boolean;
  setCampaigns: (campaigns: CRMCampaign[]) => void;
  setLeads: (leads: CRMLead[]) => void;
  setActiveCampaignId: (id: string | null) => void;
  addLead: (lead: CRMLead) => void;
  updateLead: (leadId: string, updates: Partial<CRMLead>) => void;
  addActivity: (activity: CRMLeadActivity) => void;
  loadCampaigns: () => Promise<void>;
  loadLeads: (campaignId: string) => Promise<void>;
  loadActivities: (leadId: string) => Promise<void>;
}

const CRMContext = createContext<CRMContextType | undefined>(undefined);

export const useCRM = () => {
  const context = useContext(CRMContext);
  if (!context) {
    throw new Error('useCRM must be used within a CRMProvider');
  }
  return context;
};

export const CRMProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [campaigns, setCampaigns] = useState<CRMCampaign[]>([]);
  const [leads, setLeads] = useState<CRMLead[]>([]);
  const [activities, setActivities] = useState<CRMLeadActivity[]>([]);
  const [activeCampaignId, setActiveCampaignId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const loadCampaigns = async () => {
    setLoading(true);
    try {
      const campaignData = await fetchCrmCampaigns();
      setCampaigns(campaignData);
      if (campaignData.length > 0 && !activeCampaignId) {
        setActiveCampaignId(campaignData[0].crm_id);
      }
    } catch (error) {
      console.error('Error loading campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadLeads = async (campaignId: string) => {
    setLoading(true);
    try {
      const leadsData = await fetchCrmLeadsByCampaign(campaignId);
      setLeads(leadsData);
    } catch (error) {
      console.error('Error loading leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadActivities = async (leadId: string) => {
    try {
      const activitiesData = await fetchCrmActivitiesByLead(leadId);
      setActivities(activitiesData);
    } catch (error) {
      console.error('Error loading activities:', error);
    }
  };

  const addLead = (lead: CRMLead) => {
    setLeads(prev => [...prev, lead]);
  };

  const updateLead = (leadId: string, updates: Partial<CRMLead>) => {
    setLeads(prev => prev.map(lead => 
      lead.crm_id === leadId ? { ...lead, ...updates } : lead
    ));
  };

  const addActivity = (activity: CRMLeadActivity) => {
    setActivities(prev => [...prev, activity]);
  };

  useEffect(() => {
    loadCampaigns();
  }, []);

  useEffect(() => {
    if (activeCampaignId) {
      loadLeads(activeCampaignId);
    }
  }, [activeCampaignId]);

  return (
    <CRMContext.Provider value={{
      campaigns,
      leads,
      activities,
      activeCampaignId,
      loading,
      setCampaigns,
      setLeads,
      setActiveCampaignId,
      addLead,
      updateLead,
      addActivity,
      loadCampaigns,
      loadLeads,
      loadActivities
    }}>
      {children}
    </CRMContext.Provider>
  );
};
