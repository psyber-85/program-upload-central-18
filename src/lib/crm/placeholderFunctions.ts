
// Re-export Supabase functions to maintain existing API
export {
  fetchCrmCampaigns,
  fetchCrmLeadsByCampaign,
  saveCrmLead,
  updateCrmLeadField,
  logCrmActivity,
  fetchCrmActivitiesByLead,
  importCrmLeadsFromSheet
} from './supabaseFunctions';

// Add new campaign save function
export { saveCrmCampaign } from './supabaseFunctions';
