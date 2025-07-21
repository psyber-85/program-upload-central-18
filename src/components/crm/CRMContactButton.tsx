
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Phone } from 'lucide-react';
import { CRMLead } from '@/lib/crm/types';
import { useCRM } from '@/lib/crm/CRMContext';

interface CRMContactButtonProps {
  lead: CRMLead;
}

const CRMContactButton: React.FC<CRMContactButtonProps> = ({ lead }) => {
  const { updateLead, addActivity } = useCRM();
  const [showModal, setShowModal] = useState(false);
  const [activityType, setActivityType] = useState<'Contacted' | 'Call' | 'Email'>('Contacted');
  const [note, setNote] = useState('');

  const handleContact = async () => {
    // Update last contacted timestamp
    await updateLead(lead.crm_id, 'crm_lastContacted', new Date().toISOString());
    
    // Add activity if note provided
    if (note.trim()) {
      await addActivity(lead.crm_id, {
        crm_type: activityType,
        crm_note: note.trim(),
        crm_userName: 'Current User'
      });
    }

    setNote('');
    setShowModal(false);
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowModal(true)}
        className="flex items-center gap-1"
      >
        <Phone className="h-3 w-3" />
        Contact
      </Button>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Log Contact Activity</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="activityType">Activity Type</Label>
              <Select value={activityType} onValueChange={(value: any) => setActivityType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Contacted">Contacted</SelectItem>
                  <SelectItem value="Call">Call</SelectItem>
                  <SelectItem value="Email">Email</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="note">Notes (Optional)</Label>
              <Textarea
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add notes about this contact..."
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleContact}>
                Log Contact
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CRMContactButton;
