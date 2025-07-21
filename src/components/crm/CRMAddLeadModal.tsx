
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { useCRM } from '../../lib/crm/CRMContext';
import { saveCrmLead } from '../../lib/crm/placeholderFunctions';
import { MALAYSIAN_STATES, LEAD_SCORES, LEAD_STATUSES } from '../../lib/crm/types';
import { toast } from 'sonner';

export const CRMAddLeadModal = () => {
  const { activeCampaignId, addLead } = useCRM();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    crm_name: '',
    crm_number: '',
    crm_jobRole: '',
    crm_org: '',
    crm_industry: '',
    crm_state: '',
    crm_leadSource: '',
    crm_potentialDealSize: 0,
    crm_confirmedDealSize: 0,
    crm_leadScore: 'C' as const,
    crm_status: 'Future' as const,
    crm_ownerName: '',
    crm_notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!activeCampaignId) {
      toast.error('Please select a campaign first');
      return;
    }

    if (!formData.crm_name.trim() || !formData.crm_number.trim()) {
      toast.error('Name and number are required');
      return;
    }

    setLoading(true);
    try {
      const leadData = {
        ...formData,
        crm_campaignId: activeCampaignId,
        crm_ownerId: 'user1' // Mock user ID
      };

      const newLead = await saveCrmLead(leadData);
      addLead(newLead);
      setOpen(false);
      setFormData({
        crm_name: '',
        crm_number: '',
        crm_jobRole: '',
        crm_org: '',
        crm_industry: '',
        crm_state: '',
        crm_leadSource: '',
        crm_potentialDealSize: 0,
        crm_confirmedDealSize: 0,
        crm_leadScore: 'C',
        crm_status: 'Future',
        crm_ownerName: '',
        crm_notes: ''
      });
      toast.success('Lead added successfully');
    } catch (error) {
      toast.error('Failed to add lead');
      console.error('Error adding lead:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Lead
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Lead</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="crm_name">Name *</Label>
              <Input
                id="crm_name"
                value={formData.crm_name}
                onChange={(e) => handleChange('crm_name', e.target.value)}
                placeholder="Lead name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="crm_number">Phone Number *</Label>
              <Input
                id="crm_number"
                value={formData.crm_number}
                onChange={(e) => handleChange('crm_number', e.target.value)}
                placeholder="+60123456789"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="crm_jobRole">Job Role</Label>
              <Input
                id="crm_jobRole"
                value={formData.crm_jobRole}
                onChange={(e) => handleChange('crm_jobRole', e.target.value)}
                placeholder="e.g., HR Manager"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="crm_org">Organization</Label>
              <Input
                id="crm_org"
                value={formData.crm_org}
                onChange={(e) => handleChange('crm_org', e.target.value)}
                placeholder="Company name"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="crm_industry">Industry</Label>
              <Input
                id="crm_industry"
                value={formData.crm_industry}
                onChange={(e) => handleChange('crm_industry', e.target.value)}
                placeholder="e.g., Technology"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="crm_state">State</Label>
              <Select value={formData.crm_state} onValueChange={(value) => handleChange('crm_state', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {MALAYSIAN_STATES.map((state) => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="crm_leadSource">Lead Source</Label>
              <Input
                id="crm_leadSource"
                value={formData.crm_leadSource}
                onChange={(e) => handleChange('crm_leadSource', e.target.value)}
                placeholder="e.g., LinkedIn, Email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="crm_ownerName">Owner</Label>
              <Input
                id="crm_ownerName"
                value={formData.crm_ownerName}
                onChange={(e) => handleChange('crm_ownerName', e.target.value)}
                placeholder="Sales owner"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="crm_potentialDealSize">Potential Deal Size (RM)</Label>
              <Input
                id="crm_potentialDealSize"
                type="number"
                value={formData.crm_potentialDealSize}
                onChange={(e) => handleChange('crm_potentialDealSize', Number(e.target.value))}
                placeholder="0"
                min="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="crm_confirmedDealSize">Confirmed Deal Size (RM)</Label>
              <Input
                id="crm_confirmedDealSize"
                type="number"
                value={formData.crm_confirmedDealSize}
                onChange={(e) => handleChange('crm_confirmedDealSize', Number(e.target.value))}
                placeholder="0"
                min="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="crm_leadScore">Lead Score</Label>
              <Select value={formData.crm_leadScore} onValueChange={(value) => handleChange('crm_leadScore', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LEAD_SCORES.map((score) => (
                    <SelectItem key={score} value={score}>
                      {score}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="crm_status">Status</Label>
              <Select value={formData.crm_status} onValueChange={(value) => handleChange('crm_status', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LEAD_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="crm_notes">Notes</Label>
            <Textarea
              id="crm_notes"
              value={formData.crm_notes}
              onChange={(e) => handleChange('crm_notes', e.target.value)}
              placeholder="Additional notes about this lead"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Adding...' : 'Add Lead'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
