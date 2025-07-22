
import React from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCrm } from '@/lib/crm/CRMContext';
import { CrmLead } from '@/lib/crm/types';
import { MALAYSIAN_STATES, LEAD_SCORES, LEAD_STATUSES } from '@/lib/crm/types';
import { saveCrmLead } from '@/lib/crm/placeholderFunctions';
import { toast } from 'sonner';

interface CRMAddLeadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaignId: string;
}

interface LeadFormData {
  crm_name: string;
  crm_email: string;
  crm_number: string;
  crm_jobRole: string;
  crm_org: string;
  crm_industry: string;
  crm_leadSource: string;
  crm_state: string;
  crm_potentialDealSize: string;
  crm_confirmedDealSize: string;
  crm_leadScore: string;
  crm_status: string;
  crm_ownerName: string;
  crm_notes: string;
}

const CRMAddLeadModal: React.FC<CRMAddLeadModalProps> = ({ open, onOpenChange, campaignId }) => {
  const { dispatch, loadLeads } = useCrm();
  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm<LeadFormData>();

  const onSubmit = async (data: LeadFormData) => {
    try {
      // Create new lead without manual ID - let the database generate it
      const newLead: CrmLead = {
        crm_id: 'new', // This will be replaced by the database-generated ID
        crm_campaignId: campaignId,
        crm_name: data.crm_name,
        crm_email: data.crm_email,
        crm_number: data.crm_number,
        crm_jobRole: data.crm_jobRole,
        crm_org: data.crm_org,
        crm_industry: data.crm_industry,
        crm_leadSource: data.crm_leadSource,
        crm_state: data.crm_state,
        crm_potentialDealSize: parseFloat(data.crm_potentialDealSize) || 0,
        crm_confirmedDealSize: parseFloat(data.crm_confirmedDealSize) || 0,
        crm_leadScore: data.crm_leadScore as any,
        crm_status: data.crm_status as any,
        crm_ownerName: data.crm_ownerName,
        crm_notes: data.crm_notes || undefined,
      };

      const savedLead = await saveCrmLead(newLead);
      dispatch({ type: 'ADD_LEAD', payload: savedLead });
      
      // Refresh the leads list to ensure consistency
      await loadLeads(campaignId);
      
      toast.success('Lead added successfully!');
      reset();
      onOpenChange(false);
    } catch (error) {
      console.error('Error adding lead:', error);
      toast.error('Failed to add lead. Please try again.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Lead</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="crm_name">Name *</Label>
              <Input
                id="crm_name"
                {...register('crm_name', { required: 'Name is required' })}
                placeholder="Lead name"
              />
              {errors.crm_name && (
                <p className="text-sm text-destructive">{errors.crm_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="crm_email">Email *</Label>
              <Input
                id="crm_email"
                type="email"
                {...register('crm_email', { required: 'Email is required' })}
                placeholder="email@example.com"
              />
              {errors.crm_email && (
                <p className="text-sm text-destructive">{errors.crm_email.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="crm_number">Phone Number</Label>
              <Input
                id="crm_number"
                {...register('crm_number')}
                placeholder="+60123456789"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="crm_jobRole">Job Role</Label>
              <Input
                id="crm_jobRole"
                {...register('crm_jobRole')}
                placeholder="HR Manager"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="crm_org">Organization</Label>
              <Input
                id="crm_org"
                {...register('crm_org')}
                placeholder="Company name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="crm_industry">Industry</Label>
              <Input
                id="crm_industry"
                {...register('crm_industry')}
                placeholder="Technology"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="crm_leadSource">Lead Source</Label>
              <Input
                id="crm_leadSource"
                {...register('crm_leadSource')}
                placeholder="LinkedIn, Website, etc."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="crm_state">State</Label>
              <Select onValueChange={(value) => setValue('crm_state', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {MALAYSIAN_STATES.map(state => (
                    <SelectItem key={state} value={state}>{state}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="crm_potentialDealSize">Potential Deal Size (MYR)</Label>
              <Input
                id="crm_potentialDealSize"
                type="number"
                step="0.01"
                {...register('crm_potentialDealSize')}
                placeholder="50000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="crm_confirmedDealSize">Confirmed Deal Size (MYR)</Label>
              <Input
                id="crm_confirmedDealSize"
                type="number"
                step="0.01"
                {...register('crm_confirmedDealSize')}
                placeholder="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="crm_leadScore">Lead Score</Label>
              <Select onValueChange={(value) => setValue('crm_leadScore', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select score" />
                </SelectTrigger>
                <SelectContent>
                  {LEAD_SCORES.map(score => (
                    <SelectItem key={score} value={score}>{score}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="crm_status">Status</Label>
              <Select onValueChange={(value) => setValue('crm_status', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {LEAD_STATUSES.map(status => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="crm_ownerName">Owner</Label>
              <Input
                id="crm_ownerName"
                {...register('crm_ownerName')}
                placeholder="Sales rep name"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="crm_notes">Notes</Label>
            <Textarea
              id="crm_notes"
              {...register('crm_notes')}
              placeholder="Additional notes about this lead..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Adding...' : 'Add Lead'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CRMAddLeadModal;
