
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { CRMCampaign, CRMLead, CRMLeadActivity } from './types';
import { fetchCrmCampaigns, fetchCrmLeadsByCampaign, fetchCrmLeadActivities } from './placeholderFunctions';

interface CRMState {
  campaigns: CRMCampaign[];
  currentCampaign: CRMCampaign | null;
  leads: CRMLead[];
  activities: CRMLeadActivity[];
  loading: boolean;
  error: string | null;
}

type CRMAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_CAMPAIGNS'; payload: CRMCampaign[] }
  | { type: 'SET_CURRENT_CAMPAIGN'; payload: CRMCampaign | null }
  | { type: 'SET_LEADS'; payload: CRMLead[] }
  | { type: 'SET_ACTIVITIES'; payload: CRMLeadActivity[] }
  | { type: 'ADD_CAMPAIGN'; payload: CRMCampaign }
  | { type: 'ADD_LEAD'; payload: CRMLead }
  | { type: 'UPDATE_LEAD'; payload: CRMLead }
  | { type: 'ADD_ACTIVITY'; payload: CRMLeadActivity };

const initialState: CRMState = {
  campaigns: [],
  currentCampaign: null,
  leads: [],
  activities: [],
  loading: false,
  error: null
};

const crmReducer = (state: CRMState, action: CRMAction): CRMState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_CAMPAIGNS':
      return { ...state, campaigns: action.payload };
    case 'SET_CURRENT_CAMPAIGN':
      return { ...state, currentCampaign: action.payload };
    case 'SET_LEADS':
      return { ...state, leads: action.payload };
    case 'SET_ACTIVITIES':
      return { ...state, activities: action.payload };
    case 'ADD_CAMPAIGN':
      return { ...state, campaigns: [...state.campaigns, action.payload] };
    case 'ADD_LEAD':
      return { ...state, leads: [...state.leads, action.payload] };
    case 'UPDATE_LEAD':
      return {
        ...state,
        leads: state.leads.map(lead =>
          lead.crm_id === action.payload.crm_id ? action.payload : lead
        )
      };
    case 'ADD_ACTIVITY':
      return { ...state, activities: [...state.activities, action.payload] };
    default:
      return state;
  }
};

interface CRMContextValue {
  state: CRMState;
  dispatch: React.Dispatch<CRMAction>;
  loadCampaigns: () => Promise<void>;
  loadLeads: (campaignId: string) => Promise<void>;
  loadActivities: (leadId: string) => Promise<void>;
  setCurrentCampaign: (campaign: CRMCampaign | null) => void;
}

const CRMContext = createContext<CRMContextValue | undefined>(undefined);

export const CRMProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(crmReducer, initialState);

  const loadCampaigns = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const campaigns = await fetchCrmCampaigns();
      dispatch({ type: 'SET_CAMPAIGNS', payload: campaigns });
      dispatch({ type: 'SET_ERROR', payload: null });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load campaigns' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const loadLeads = async (campaignId: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const leads = await fetchCrmLeadsByCampaign(campaignId);
      dispatch({ type: 'SET_LEADS', payload: leads });
      dispatch({ type: 'SET_ERROR', payload: null });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load leads' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const loadActivities = async (leadId: string) => {
    try {
      const activities = await fetchCrmLeadActivities(leadId);
      dispatch({ type: 'SET_ACTIVITIES', payload: activities });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load activities' });
    }
  };

  const setCurrentCampaign = (campaign: CRMCampaign | null) => {
    dispatch({ type: 'SET_CURRENT_CAMPAIGN', payload: campaign });
  };

  useEffect(() => {
    loadCampaigns();
  }, []);

  return (
    <CRMContext.Provider
      value={{
        state,
        dispatch,
        loadCampaigns,
        loadLeads,
        loadActivities,
        setCurrentCampaign
      }}
    >
      {children}
    </CRMContext.Provider>
  );
};

export const useCRM = () => {
  const context = useContext(CRMContext);
  if (context === undefined) {
    throw new Error('useCRM must be used within a CRMProvider');
  }
  return context;
};
