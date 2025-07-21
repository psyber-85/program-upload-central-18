
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Phone } from 'lucide-react';
import { CRMLead, ACTIVITY_TYPES } from '../../lib/crm/types';
import { useCRM } from '../../lib/crm/CRMContext';
import { logCrmActivity, updateCrmLeadField } from '../../lib/crm/placeholderFunctions';
import { toast } from 'sonner';

interface CRMContactButtonProps {
  lead: CRMLead;
}

export const CRMContactButton: React.FC<CRMContactButtonProps> = ({ lead }) => {
  const { updateLead, addActivity } = useCRM();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activityType, setActivityType] = useState<string>('Contacted');
  const [note, setNote] = useState('');

  const handleContact = async () => {
    setLoading(true);
    try {
      const now = new Date().toISOString();
      
      // Update last contacted time
      await updateCrmLeadField(lead.crm_id, 'crm_lastContacted', now);
      updateLead(lead.crm_id, { crm_lastContacted: now });

      // Log activity if note is provided
      if (note.trim() || activityType !== 'Contacted') {
        const activity = {
          crm_type: activityType as any,
          crm_note: note.trim() || `${activityType} activity logged`,
          crm_timestamp: now,
          crm_userId: 'user1',
          crm_userName: 'Current User'
        };

        const newActivity = await logCrmActivity(lead.crm_id, activity);
        addActivity(newActivity);
      }

      setOpen(false);
      setNote('');
      setActivityType('Contacted');
      toast.success('Contact logged successfully');
    } catch (error) {
      toast.error('Failed to log contact');
      console.error('Error logging contact:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Phone className="h-4 w-4 mr-1" />
          Contact
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Log Contact Activity</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Lead: {lead.crm_name}</Label>
            <p className="text-sm text-gray-600">
              This will update the "Last Contacted" time to now.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="activityType">Activity Type</Label>
            <Select value={activityType} onValueChange={setActivityType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ACTIVITY_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
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

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleContact} disabled={loading}>
              {loading ? 'Logging...' : 'Log Contact'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
