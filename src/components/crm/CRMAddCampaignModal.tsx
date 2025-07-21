
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useCRM } from '@/lib/crm/CRMContext';

interface CRMAddCampaignModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CRMAddCampaignModal: React.FC<CRMAddCampaignModalProps> = ({ open, onOpenChange }) => {
  const { addCampaign } = useCRM();
  const [formData, setFormData] = useState({
    crm_name: '',
    crm_objective: '',
    crm_startDate: '',
    crm_endDate: '',
    crm_notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.crm_name.trim()) return;

    addCampaign(formData);
    setFormData({
      crm_name: '',
      crm_objective: '',
      crm_startDate: '',
      crm_endDate: '',
      crm_notes: ''
    });
    onOpenChange(false);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Campaign</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="crm_name">Campaign Name *</Label>
            <Input
              id="crm_name"
              value={formData.crm_name}
              onChange={(e) => handleChange('crm_name', e.target.value)}
              placeholder="Enter campaign name"
              required
            />
          </div>

          <div>
            <Label htmlFor="crm_objective">Objective</Label>
            <Input
              id="crm_objective"
              value={formData.crm_objective}
              onChange={(e) => handleChange('crm_objective', e.target.value)}
              placeholder="Campaign objective"
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
              placeholder="Campaign notes"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
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
