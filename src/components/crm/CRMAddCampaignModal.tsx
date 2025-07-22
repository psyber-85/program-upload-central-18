
import React from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCrm } from '@/lib/crm/CRMContext';
import { CrmCampaign } from '@/lib/crm/types';
import { toast } from 'sonner';

interface CRMAddCampaignModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface CampaignFormData {
  crm_name: string;
  crm_objective: string;
  crm_startDate: string;
  crm_endDate: string;
  crm_notes: string;
}

const CRMAddCampaignModal: React.FC<CRMAddCampaignModalProps> = ({ open, onOpenChange }) => {
  const { state, dispatch } = useCrm();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CampaignFormData>();

  const onSubmit = async (data: CampaignFormData) => {
    try {
      const newCampaign: CrmCampaign = {
        crm_id: Date.now().toString(),
        crm_name: data.crm_name,
        crm_objective: data.crm_objective || undefined,
        crm_startDate: data.crm_startDate || undefined,
        crm_endDate: data.crm_endDate || undefined,
        crm_notes: data.crm_notes || undefined,
      };

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      dispatch({ type: 'SET_CAMPAIGNS', payload: [...state.campaigns, newCampaign] });
      dispatch({ type: 'SET_ACTIVE_CAMPAIGN', payload: newCampaign.crm_id });
      
      toast.success('Campaign created successfully!');
      reset();
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to create campaign');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Campaign</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="crm_name">Campaign Name *</Label>
            <Input
              id="crm_name"
              {...register('crm_name', { required: 'Campaign name is required' })}
              placeholder="Enter campaign name"
            />
            {errors.crm_name && (
              <p className="text-sm text-destructive">{errors.crm_name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="crm_objective">Objective</Label>
            <Input
              id="crm_objective"
              {...register('crm_objective')}
              placeholder="Campaign objective"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="crm_startDate">Start Date</Label>
              <Input
                id="crm_startDate"
                type="date"
                {...register('crm_startDate')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="crm_endDate">End Date</Label>
              <Input
                id="crm_endDate"
                type="date"
                {...register('crm_endDate')}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="crm_notes">Notes</Label>
            <Textarea
              id="crm_notes"
              {...register('crm_notes')}
              placeholder="Campaign notes..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Campaign</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CRMAddCampaignModal;
