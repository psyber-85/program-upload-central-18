
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { CrmCampaign, CrmLead, CrmLeadActivity } from './types';
import { mockCrmData } from './mockData';
import { toast } from 'sonner';

interface CrmState {
  campaigns: CrmCampaign[];
  activeCampaignId: string | null;
  leads: CrmLead[];
  activities: CrmLeadActivity[];
  loading: boolean;
  searchTerm: string;
  sortField: keyof CrmLead | null;
  sortDirection: 'asc' | 'desc';
  error: string | null;
}

type CrmAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_CAMPAIGNS'; payload: CrmCampaign[] }
  | { type: 'SET_ACTIVE_CAMPAIGN'; payload: string }
  | { type: 'SET_LEADS'; payload: CrmLead[] }
  | { type: 'UPDATE_LEAD'; payload: CrmLead }
  | { type: 'ADD_LEAD'; payload: CrmLead }
  | { type: 'SET_ACTIVITIES'; payload: CrmLeadActivity[] }
  | { type: 'ADD_ACTIVITY'; payload: CrmLeadActivity }
  | { type: 'SET_SEARCH_TERM'; payload: string }
  | { type: 'SET_SORT'; payload: { field: keyof CrmLead; direction: 'asc' | 'desc' } };

const initialState: CrmState = {
  campaigns: [],
  activeCampaignId: null,
  leads: [],
  activities: [],
  loading: true,
  searchTerm: '',
  sortField: null,
  sortDirection: 'asc',
  error: null
};

const crmReducer = (state: CrmState, action: CrmAction): CrmState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_CAMPAIGNS':
      return { 
        ...state, 
        campaigns: action.payload,
        activeCampaignId: action.payload.length > 0 && !state.activeCampaignId 
          ? action.payload[0].crm_id 
          : state.activeCampaignId
      };
    case 'SET_ACTIVE_CAMPAIGN':
      return { ...state, activeCampaignId: action.payload };
    case 'SET_LEADS':
      return { ...state, leads: action.payload };
    case 'UPDATE_LEAD':
      return {
        ...state,
        leads: state.leads.map(lead => 
          lead.crm_id === action.payload.crm_id ? action.payload : lead
        )
      };
    case 'ADD_LEAD':
      return { ...state, leads: [...state.leads, action.payload] };
    case 'SET_ACTIVITIES':
      return { ...state, activities: action.payload };
    case 'ADD_ACTIVITY':
      return { ...state, activities: [...state.activities, action.payload] };
    case 'SET_SEARCH_TERM':
      return { ...state, searchTerm: action.payload };
    case 'SET_SORT':
      return { 
        ...state, 
        sortField: action.payload.field, 
        sortDirection: action.payload.direction 
      };
    default:
      return state;
  }
};

const CrmContext = createContext<{
  state: CrmState;
  dispatch: React.Dispatch<CrmAction>;
  loadLeads: (campaignId: string) => Promise<void>;
  loadActivities: (leadId: string) => Promise<void>;
  refreshCampaigns: () => Promise<void>;
} | null>(null);

export const CrmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(crmReducer, initialState);

  const loadLeads = async (campaignId: string) => {
    if (!campaignId) return;
    
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    
    try {
      // Simulate loading delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Filter mock leads by campaign ID
      const leads = mockCrmData.crm_leads.filter(lead => lead.crm_campaignId === campaignId);
      dispatch({ type: 'SET_LEADS', payload: leads });
    } catch (error) {
      console.error('Error loading leads:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load leads';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast.error(errorMessage);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const loadActivities = async (leadId: string) => {
    try {
      // Simulate loading delay
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Filter mock activities by lead ID
      const activities = mockCrmData.crm_lead_activities.filter(activity => activity.crm_leadId === leadId);
      dispatch({ type: 'SET_ACTIVITIES', payload: activities });
    } catch (error) {
      console.error('Error loading activities:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load activities';
      toast.error(errorMessage);
    }
  };

  const refreshCampaigns = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    
    try {
      // Simulate loading delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Use mock campaigns data
      const campaigns = mockCrmData.crm_campaigns;
      dispatch({ type: 'SET_CAMPAIGNS', payload: campaigns });
    } catch (error) {
      console.error('Error loading campaigns:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load campaigns';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast.error(errorMessage);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  useEffect(() => {
    refreshCampaigns();
  }, []);

  // Load leads when active campaign changes
  useEffect(() => {
    if (state.activeCampaignId) {
      loadLeads(state.activeCampaignId);
    }
  }, [state.activeCampaignId]);

  return (
    <CrmContext.Provider value={{ state, dispatch, loadLeads, loadActivities, refreshCampaigns }}>
      {children}
    </CrmContext.Provider>
  );
};

export const useCrm = () => {
  const context = useContext(CrmContext);
  if (!context) {
    throw new Error('useCrm must be used within a CrmProvider');
  }
  return context;
};
