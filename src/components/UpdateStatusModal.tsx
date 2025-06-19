
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { AlertCircle } from 'lucide-react';

interface UpdateStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  prospectId: string;
  onComplete: () => void;
}

const statusOptions = [
  'Pending',
  'Approved',
  'Rejected',
  'Postponed',
  'On Hold'
];

const UpdateStatusModal: React.FC<UpdateStatusModalProps> = ({
  isOpen,
  onClose,
  prospectId,
  onComplete
}) => {
  const [selectedStatus, setSelectedStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStatus) return;

    setIsSubmitting(true);
    try {
      // TODO: fetch(`/api/prospects/${prospectId}/status`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ status: selectedStatus }) })
      await fetch(`/api/prospects/${prospectId}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: selectedStatus })
      });

      onComplete();
      onClose();
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Update Registration Status
          </DialogTitle>
          <DialogDescription>
            Change the registration status for this prospect
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="status">Registration Status</Label>
              <select
                id="status"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                required
                className="w-full h-10 px-3 py-2 border border-input bg-background rounded-md"
              >
                <option value="">Select status...</option>
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !selectedStatus}>
              {isSubmitting ? 'Updating...' : 'Update Status'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateStatusModal;
