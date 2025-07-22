
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Phone } from 'lucide-react';
import { useCrm } from '@/lib/crm/CRMContext';
import { logCrmActivity, updateCrmLeadField } from '@/lib/crm/placeholderFunctions';
import { ACTIVITY_TYPES } from '@/lib/crm/types';
import { toast } from 'sonner';

interface CRMContactButtonProps {
  leadId: string;
}

const CRMContactButton: React.FC<CRMContactButtonProps> = ({ leadId }) => {
  const { state, dispatch } = useCrm();
  const [showModal, setShowModal] = useState(false);
  const [note, setNote] = useState('');
  const [activityType, setActivityType] = useState<string>('Contacted');
  const [loading, setLoading] = useState(false);

  const handleContact = async () => {
    setLoading(true);
    try {
      // Update last contacted timestamp
      const now = new Date().toISOString();
      await updateCrmLeadField(leadId, 'crm_lastContacted', now);
      
      // Log the activity
      const activity = {
        crm_type: activityType as any,
        crm_note: note || 'Lead contacted',
        crm_timestamp: now,
        crm_userId: '1',
        crm_userName: 'Current User'
      };

      const savedActivity = await logCrmActivity(leadId, activity);
      dispatch({ type: 'ADD_ACTIVITY', payload: savedActivity });

      // Update the lead in state
      const lead = state.leads.find(l => l.crm_id === leadId);
      if (lead) {
        const updatedLead = { ...lead, crm_lastContacted: now };
        dispatch({ type: 'UPDATE_LEAD', payload: updatedLead });
      }

      toast.success('Contact logged successfully!');
      setNote('');
      setShowModal(false);
    } catch (error) {
      toast.error('Failed to log contact');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        onClick={() => setShowModal(true)}
        className="flex items-center space-x-1"
      >
        <Phone className="h-3 w-3" />
        <span className="hidden sm:inline">Contact</span>
      </Button>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Log Contact Activity</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="activityType">Activity Type</Label>
              <Select value={activityType} onValueChange={setActivityType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ACTIVITY_TYPES.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="note">Notes (Optional)</Label>
              <Textarea
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add notes about this contact..."
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleContact} disabled={loading}>
                {loading ? 'Logging...' : 'Log Contact'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CRMContactButton;
