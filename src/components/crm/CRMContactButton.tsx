
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Phone } from 'lucide-react';
import { toast } from 'sonner';
import { useCRM } from '@/lib/crm/CRMContext';
import { updateCrmLeadField, logCrmActivity } from '@/lib/crm/placeholderFunctions';

interface CRMContactButtonProps {
  leadId: string;
}

const CRMContactButton: React.FC<CRMContactButtonProps> = ({ leadId }) => {
  const { dispatch } = useCRM();
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleContact = async () => {
    setIsSubmitting(true);
    try {
      // Update last contacted timestamp
      const updatedLead = await updateCrmLeadField(leadId, 'crm_lastContacted', new Date().toISOString());
      
      if (updatedLead) {
        dispatch({ type: 'UPDATE_LEAD', payload: updatedLead });
      }
      
      // Show note modal
      setShowNoteModal(true);
    } catch (error) {
      toast.error('Failed to update contact timestamp');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveNote = async () => {
    if (!note.trim()) {
      toast.error('Please enter a note');
      return;
    }

    setIsSubmitting(true);
    try {
      // Log activity
      await logCrmActivity(leadId, {
        crm_type: 'Contacted',
        crm_note: note,
        crm_timestamp: new Date().toISOString(),
        crm_userId: 'u1', // Mock user ID
        crm_userName: 'Current User'
      });

      toast.success('Contact logged successfully');
      setNote('');
      setShowNoteModal(false);
    } catch (error) {
      toast.error('Failed to log contact');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handleContact}
        disabled={isSubmitting}
      >
        <Phone className="h-3 w-3 mr-1" />
        Contact
      </Button>

      <Dialog open={showNoteModal} onOpenChange={setShowNoteModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Contact Note</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="contact-note">Note</Label>
              <Textarea
                id="contact-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="What did you discuss?"
                rows={4}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowNoteModal(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveNote}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Save Note'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CRMContactButton;
