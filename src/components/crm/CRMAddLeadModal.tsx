
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useCRM } from '@/lib/crm/CRMContext';
import { MALAYSIAN_STATES } from '@/lib/crm/types';

interface CRMAddLeadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CRMAddLeadModal: React.FC<CRMAddLeadModalProps> = ({ open, onOpenChange }) => {
  const { addLead } = useCRM();
  const [formData, setFormData] = useState({
    crm_name: '',
    crm_number: '',
    crm_jobRole: '',
    crm_org: '',
    crm_industry: '',
    crm_state: 'Kuala Lumpur',
    crm_leadSource: '',
    crm_nextFollowUp: '',
    crm_potentialDealSize: 0,
    crm_confirmedDealSize: 0,
    crm_leadScore: 'C' as 'A' | 'B' | 'C' | 'D' | 'E',
    crm_status: 'Future' as 'Success' | 'Lost' | 'Future',
    crm_ownerName: '',
    crm_notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.crm_name.trim()) return;

    await addLead(formData);
    setFormData({
      crm_name: '',
      crm_number: '',
      crm_jobRole: '',
      crm_org: '',
      crm_industry: '',
      crm_state: 'Kuala Lumpur',
      crm_leadSource: '',
      crm_nextFollowUp: '',
      crm_potentialDealSize: 0,
      crm_confirmedDealSize: 0,
      crm_leadScore: 'C',
      crm_status: 'Future',
      crm_ownerName: '',
      crm_notes: ''
    });
    onOpenChange(false);
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Lead</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="crm_name">Name *</Label>
              <Input
                id="crm_name"
                value={formData.crm_name}
                onChange={(e) => handleChange('crm_name', e.target.value)}
                placeholder="Lead name"
                required
              />
            </div>
            <div>
              <Label htmlFor="crm_number">Contact Number</Label>
              <Input
                id="crm_number"
                value={formData.crm_number}
                onChange={(e) => handleChange('crm_number', e.target.value)}
                placeholder="+60123456789"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="crm_jobRole">Job Role</Label>
              <Input
                id="crm_jobRole"
                value={formData.crm_jobRole}
                onChange={(e) => handleChange('crm_jobRole', e.target.value)}
                placeholder="Job title"
              />
            </div>
            <div>
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
            <div>
              <Label htmlFor="crm_industry">Industry</Label>
              <Input
                id="crm_industry"
                value={formData.crm_industry}
                onChange={(e) => handleChange('crm_industry', e.target.value)}
                placeholder="Industry"
              />
            </div>
            <div>
              <Label htmlFor="crm_state">State</Label>
              <Select value={formData.crm_state} onValueChange={(value) => handleChange('crm_state', value)}>
                <SelectTrigger>
                  <SelectValue />
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
            <div>
              <Label htmlFor="crm_leadSource">Lead Source</Label>
              <Input
                id="crm_leadSource"
                value={formData.crm_leadSource}
                onChange={(e) => handleChange('crm_leadSource', e.target.value)}
                placeholder="LinkedIn, Email, etc."
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="crm_potentialDealSize">Potential Deal Size (MYR)</Label>
              <Input
                id="crm_potentialDealSize"
                type="number"
                value={formData.crm_potentialDealSize}
                onChange={(e) => handleChange('crm_potentialDealSize', Number(e.target.value))}
                placeholder="0"
              />
            </div>
            <div>
              <Label htmlFor="crm_confirmedDealSize">Confirmed Deal Size (MYR)</Label>
              <Input
                id="crm_confirmedDealSize"
                type="number"
                value={formData.crm_confirmedDealSize}
                onChange={(e) => handleChange('crm_confirmedDealSize', Number(e.target.value))}
                placeholder="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="crm_leadScore">Lead Score</Label>
              <Select value={formData.crm_leadScore} onValueChange={(value) => handleChange('crm_leadScore', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {['A', 'B', 'C', 'D', 'E'].map(score => (
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
                  {['Success', 'Lost', 'Future'].map(status => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="crm_ownerName">Owner</Label>
              <Input
                id="crm_ownerName"
                value={formData.crm_ownerName}
                onChange={(e) => handleChange('crm_ownerName', e.target.value)}
                placeholder="Owner name"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="crm_notes">Notes</Label>
            <Textarea
              id="crm_notes"
              value={formData.crm_notes}
              onChange={(e) => handleChange('crm_notes', e.target.value)}
              placeholder="Additional notes"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Lead</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CRMAddLeadModal;
