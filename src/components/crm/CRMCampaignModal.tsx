
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useCRM } from '@/lib/crm/CRMContext';
import { saveCrmCampaign } from '@/lib/crm/placeholderFunctions';

interface CRMCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CRMCampaignModal: React.FC<CRMCampaignModalProps> = ({ isOpen, onClose }) => {
  const { dispatch } = useCRM();
  const [formData, setFormData] = useState({
    crm_name: '',
    crm_objective: '',
    crm_startDate: '',
    crm_endDate: '',
    crm_notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.crm_name.trim()) {
      toast.error('Campaign name is required');
      return;
    }

    setIsSubmitting(true);
    try {
      const newCampaign = await saveCrmCampaign(formData);
      dispatch({ type: 'ADD_CAMPAIGN', payload: newCampaign });
      toast.success('Campaign created successfully');
      
      // Reset form
      setFormData({
        crm_name: '',
        crm_objective: '',
        crm_startDate: '',
        crm_endDate: '',
        crm_notes: ''
      });
      onClose();
    } catch (error) {
      toast.error('Failed to create campaign');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Campaign</DialogTitle>
          <DialogDescription>
            Set up a new CRM campaign to track leads and opportunities.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="crm_name">Campaign Name *</Label>
            <Input
              id="crm_name"
              value={formData.crm_name}
              onChange={(e) => handleChange('crm_name', e.target.value)}
              placeholder="e.g., Q4 Enterprise Outreach"
              required
            />
          </div>

          <div>
            <Label htmlFor="crm_objective">Objective</Label>
            <Input
              id="crm_objective"
              value={formData.crm_objective}
              onChange={(e) => handleChange('crm_objective', e.target.value)}
              placeholder="e.g., Target enterprise clients for Q4 sales"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="crm_startDate">Start Date</Label>
              <Input
                id="crm_startDate"
                type="date"
                value={formData.crm_startDate}
                onChange={(e) => handleChange('crm_startDate', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="crm_endDate">End Date</Label>
              <Input
                id="crm_endDate"
                type="date"
                value={formData.crm_endDate}
                onChange={(e) => handleChange('crm_endDate', e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="crm_notes">Notes</Label>
            <Textarea
              id="crm_notes"
              value={formData.crm_notes}
              onChange={(e) => handleChange('crm_notes', e.target.value)}
              placeholder="Additional campaign details..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Campaign'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CRMCampaignModal;
