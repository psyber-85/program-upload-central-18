
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import { useCRM } from '../../lib/crm/CRMContext';
import { createCrmCampaign } from '../../lib/crm/placeholderFunctions';
import { toast } from 'sonner';

export const CRMAddCampaignModal = () => {
  const { setCampaigns, campaigns, setActiveCampaignId } = useCRM();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    crm_name: '',
    crm_objective: '',
    crm_startDate: '',
    crm_endDate: '',
    crm_notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.crm_name.trim()) {
      toast.error('Campaign name is required');
      return;
    }

    setLoading(true);
    try {
      const newCampaign = await createCrmCampaign(formData);
      setCampaigns([...campaigns, newCampaign]);
      setActiveCampaignId(newCampaign.crm_id);
      setOpen(false);
      setFormData({
        crm_name: '',
        crm_objective: '',
        crm_startDate: '',
        crm_endDate: '',
        crm_notes: ''
      });
      toast.success('Campaign created successfully');
    } catch (error) {
      toast.error('Failed to create campaign');
      console.error('Error creating campaign:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          New Campaign
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Campaign</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="crm_name">Campaign Name *</Label>
            <Input
              id="crm_name"
              value={formData.crm_name}
              onChange={(e) => handleChange('crm_name', e.target.value)}
              placeholder="Enter campaign name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="crm_objective">Objective</Label>
            <Textarea
              id="crm_objective"
              value={formData.crm_objective}
              onChange={(e) => handleChange('crm_objective', e.target.value)}
              placeholder="What is the goal of this campaign?"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="crm_startDate">Start Date</Label>
              <Input
                id="crm_startDate"
                type="date"
                value={formData.crm_startDate}
                onChange={(e) => handleChange('crm_startDate', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="crm_endDate">End Date</Label>
              <Input
                id="crm_endDate"
                type="date"
                value={formData.crm_endDate}
                onChange={(e) => handleChange('crm_endDate', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="crm_notes">Notes</Label>
            <Textarea
              id="crm_notes"
              value={formData.crm_notes}
              onChange={(e) => handleChange('crm_notes', e.target.value)}
              placeholder="Additional campaign notes"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Campaign'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
