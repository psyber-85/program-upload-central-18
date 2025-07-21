
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CRMCampaign, CRMLead, CRMLeadActivity } from './types';
import { fetchCrmCampaigns, fetchCrmLeadsByCampaign, saveCrmLead, updateCrmLeadField, logCrmActivity } from './placeholderFunctions';

interface CRMContextType {
  campaigns: CRMCampaign[];
  currentCampaign: CRMCampaign | null;
  leads: CRMLead[];
  activities: CRMLeadActivity[];
  loading: boolean;
  setCurrentCampaign: (campaign: CRMCampaign) => void;
  addCampaign: (campaign: Omit<CRMCampaign, 'crm_id'>) => void;
  addLead: (lead: Partial<CRMLead>) => Promise<void>;
  updateLead: (leadId: string, field: string, value: any) => Promise<void>;
  addActivity: (leadId: string, activity: Partial<CRMLeadActivity>) => Promise<void>;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const CRMContext = createContext<CRMContextType | undefined>(undefined);

export const useCRM = () => {
  const context = useContext(CRMContext);
  if (!context) {
    throw new Error('useCRM must be used within a CRMProvider');
  }
  return context;
};

interface CRMProviderProps {
  children: ReactNode;
}

export const CRMProvider: React.FC<CRMProviderProps> = ({ children }) => {
  const [campaigns, setCampaigns] = useState<CRMCampaign[]>([]);
  const [currentCampaign, setCurrentCampaign] = useState<CRMCampaign | null>(null);
  const [leads, setLeads] = useState<CRMLead[]>([]);
  const [activities, setActivities] = useState<CRMLeadActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadCampaigns();
  }, []);

  useEffect(() => {
    if (currentCampaign) {
      loadLeadsForCampaign(currentCampaign.crm_id);
    }
  }, [currentCampaign]);

  const loadCampaigns = async () => {
    try {
      const campaignData = await fetchCrmCampaigns();
      setCampaigns(campaignData);
      if (campaignData.length > 0 && !currentCampaign) {
        setCurrentCampaign(campaignData[0]);
      }
    } catch (error) {
      console.error('Error loading campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadLeadsForCampaign = async (campaignId: string) => {
    try {
      setLoading(true);
      const leadsData = await fetchCrmLeadsByCampaign(campaignId);
      setLeads(leadsData);
    } catch (error) {
      console.error('Error loading leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const addCampaign = (campaignData: Omit<CRMCampaign, 'crm_id'>) => {
    const newCampaign: CRMCampaign = {
      ...campaignData,
      crm_id: Date.now().toString()
    };
    setCampaigns(prev => [...prev, newCampaign]);
    setCurrentCampaign(newCampaign);
  };

  const addLead = async (leadData: Partial<CRMLead>) => {
    try {
      const newLead = await saveCrmLead({
        ...leadData,
        crm_campaignId: currentCampaign?.crm_id
      });
      setLeads(prev => [...prev, newLead]);
    } catch (error) {
      console.error('Error adding lead:', error);
    }
  };

  const updateLead = async (leadId: string, field: string, value: any) => {
    try {
      await updateCrmLeadField(leadId, field, value);
      setLeads(prev => 
        prev.map(lead => 
          lead.crm_id === leadId 
            ? { ...lead, [field]: value }
            : lead
        )
      );
    } catch (error) {
      console.error('Error updating lead:', error);
    }
  };

  const addActivity = async (leadId: string, activityData: Partial<CRMLeadActivity>) => {
    try {
      const newActivity = await logCrmActivity(leadId, activityData);
      setActivities(prev => [...prev, newActivity]);
    } catch (error) {
      console.error('Error adding activity:', error);
    }
  };

  const value: CRMContextType = {
    campaigns,
    currentCampaign,
    leads,
    activities,
    loading,
    setCurrentCampaign,
    addCampaign,
    addLead,
    updateLead,
    addActivity,
    searchTerm,
    setSearchTerm
  };

  return (
    <CRMContext.Provider value={value}>
      {children}
    </CRMContext.Provider>
  );
};
