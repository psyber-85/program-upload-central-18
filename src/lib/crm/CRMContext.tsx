
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { CrmCampaign, CrmLead, CrmLeadActivity } from './types';
import { fetchCrmCampaigns, fetchCrmLeadsByCampaign, fetchCrmActivitiesByLead } from './placeholderFunctions';

interface CrmState {
  campaigns: CrmCampaign[];
  activeCampaignId: string | null;
  leads: CrmLead[];
  activities: CrmLeadActivity[];
  loading: boolean;
  searchTerm: string;
  sortField: keyof CrmLead | null;
  sortDirection: 'asc' | 'desc';
}

type CrmAction =
  | { type: 'SET_LOADING'; payload: boolean }
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
  sortDirection: 'asc'
};

const crmReducer = (state: CrmState, action: CrmAction): CrmState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_CAMPAIGNS':
      return { 
        ...state, 
        campaigns: action.payload,
        activeCampaignId: action.payload.length > 0 ? action.payload[0].crm_id : null
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
} | null>(null);

export const CrmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(crmReducer, initialState);

  const loadLeads = async (campaignId: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const leads = await fetchCrmLeadsByCampaign(campaignId);
      dispatch({ type: 'SET_LEADS', payload: leads });
    } catch (error) {
      console.error('Error loading leads:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const loadActivities = async (leadId: string) => {
    try {
      const activities = await fetchCrmActivitiesByLead(leadId);
      dispatch({ type: 'SET_ACTIVITIES', payload: activities });
    } catch (error) {
      console.error('Error loading activities:', error);
    }
  };

  useEffect(() => {
    const loadCampaigns = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const campaigns = await fetchCrmCampaigns();
        dispatch({ type: 'SET_CAMPAIGNS', payload: campaigns });
        
        if (campaigns.length > 0) {
          await loadLeads(campaigns[0].crm_id);
        }
      } catch (error) {
        console.error('Error loading campaigns:', error);
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    loadCampaigns();
  }, []);

  return (
    <CrmContext.Provider value={{ state, dispatch, loadLeads, loadActivities }}>
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
