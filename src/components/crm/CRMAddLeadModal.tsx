
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useCRM } from '@/lib/crm/CRMContext';
import { saveCrmLead } from '@/lib/crm/placeholderFunctions';
import { MALAYSIAN_STATES, LEAD_SCORES, LEAD_STATUSES } from '@/lib/crm/types';

interface CRMAddLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaignId: string;
}

const CRMAddLeadModal: React.FC<CRMAddLeadModalProps> = ({ isOpen, onClose, campaignId }) => {
  const { dispatch } = useCRM();
  const [formData, setFormData] = useState({
    crm_name: '',
    crm_number: '',
    crm_jobRole: '',
    crm_org: '',
    crm_industry: '',
    crm_state: '',
    crm_leadSource: '',
    crm_nextFollowUp: '',
    crm_potentialDealSize: '',
    crm_confirmedDealSize: '',
    crm_leadScore: 'C' as const,
    crm_status: 'Future' as const,
    crm_ownerName: '',
    crm_notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.crm_name.trim() || !formData.crm_number.trim()) {
      toast.error('Name and number are required');
      return;
    }

    setIsSubmitting(true);
    try {
      const leadData = {
        ...formData,
        crm_campaignId: campaignId,
        crm_potentialDealSize: Number(formData.crm_potentialDealSize) || 0,
        crm_confirmedDealSize: Number(formData.crm_confirmedDealSize) || 0,
        crm_ownerId: 'u1' // Mock user ID
      };

      const newLead = await saveCrmLead(leadData);
      dispatch({ type: 'ADD_LEAD', payload: newLead });
      toast.success('Lead added successfully');
      
      // Reset form
      setFormData({
        crm_name: '',
        crm_number: '',
        crm_jobRole: '',
        crm_org: '',
        crm_industry: '',
        crm_state: '',
        crm_leadSource: '',
        crm_nextFollowUp: '',
        crm_potentialDealSize: '',
        crm_confirmedDealSize: '',
        crm_leadScore: 'C',
        crm_status: 'Future',
        crm_ownerName: '',
        crm_notes: ''
      });
      onClose();
    } catch (error) {
      toast.error('Failed to add lead');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Lead</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="crm_name">Name *</Label>
              <Input
                id="crm_name"
                value={formData.crm_name}
                onChange={(e) => handleChange('crm_name', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="crm_number">Phone Number *</Label>
              <Input
                id="crm_number"
                value={formData.crm_number}
                onChange={(e) => handleChange('crm_number', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="crm_jobRole">Job Role</Label>
              <Input
                id="crm_jobRole"
                value={formData.crm_jobRole}
                onChange={(e) => handleChange('crm_jobRole', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="crm_org">Organization</Label>
              <Input
                id="crm_org"
                value={formData.crm_org}
                onChange={(e) => handleChange('crm_org', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="crm_industry">Industry</Label>
              <Input
                id="crm_industry"
                value={formData.crm_industry}
                onChange={(e) => handleChange('crm_industry', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="crm_state">State</Label>
              <Select value={formData.crm_state} onValueChange={(value) => handleChange('crm_state', value)}>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="crm_leadSource">Lead Source</Label>
              <Input
                id="crm_leadSource"
                value={formData.crm_leadSource}
                onChange={(e) => handleChange('crm_leadSource', e.target.value)}
                placeholder="e.g., LinkedIn, Trade Show"
              />
            </div>
            <div>
              <Label htmlFor="crm_nextFollowUp">Next Follow Up</Label>
              <Input
                id="crm_nextFollowUp"
                type="date"
                value={formData.crm_nextFollowUp}
                onChange={(e) => handleChange('crm_nextFollowUp', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="crm_potentialDealSize">Potential Deal Size (RM)</Label>
              <Input
                id="crm_potentialDealSize"
                type="number"
                value={formData.crm_potentialDealSize}
                onChange={(e) => handleChange('crm_potentialDealSize', e.target.value)}
                min="0"
              />
            </div>
            <div>
              <Label htmlFor="crm_confirmedDealSize">Confirmed Deal Size (RM)</Label>
              <Input
                id="crm_confirmedDealSize"
                type="number"
                value={formData.crm_confirmedDealSize}
                onChange={(e) => handleChange('crm_confirmedDealSize', e.target.value)}
                min="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="crm_leadScore">Lead Score</Label>
              <Select value={formData.crm_leadScore} onValueChange={(value) => handleChange('crm_leadScore', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LEAD_SCORES.map(score => (
                    <SelectItem key={score} value={score}>{score}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="crm_status">Status</Label>
              <Select value={formData.crm_status} onValueChange={(value) => handleChange('crm_status', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LEAD_STATUSES.map(status => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="crm_ownerName">Owner Name</Label>
              <Input
                id="crm_ownerName"
                value={formData.crm_ownerName}
                onChange={(e) => handleChange('crm_ownerName', e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="crm_notes">Notes</Label>
            <Textarea
              id="crm_notes"
              value={formData.crm_notes}
              onChange={(e) => handleChange('crm_notes', e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
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
