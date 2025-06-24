
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

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
  const [statusReason, setStatusReason] = useState('');
  const [currentStatus, setCurrentStatus] = useState('');
  const [currentReason, setCurrentReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && prospectId) {
      loadCurrentStatus();
    }
  }, [isOpen, prospectId]);

  const loadCurrentStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('prospects')
        .select('registration_status, status_reason')
        .eq('id', prospectId)
        .single();

      if (error) throw error;

      if (data) {
        setCurrentStatus(data.registration_status || 'Pending');
        setCurrentReason(data.status_reason || '');
        setSelectedStatus(data.registration_status || 'Pending');
        setStatusReason(data.status_reason || '');
      }
    } catch (error) {
      console.error('Failed to load current status:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStatus || !prospectId) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('prospects')
        .update({
          registration_status: selectedStatus,
          status_reason: statusReason || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', prospectId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Registration status updated to ${selectedStatus}`,
      });

      onComplete();
      onClose();
    } catch (error) {
      console.error('Failed to update status:', error);
      toast({
        title: "Error",
        description: "Failed to update status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedStatus('');
    setStatusReason('');
    setCurrentStatus('');
    setCurrentReason('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Update Registration Status
          </DialogTitle>
          <DialogDescription>
            Change the registration status for this prospect
            {currentStatus && (
              <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                <div><strong>Current Status:</strong> {currentStatus}</div>
                {currentReason && (
                  <div className="mt-1"><strong>Current Reason:</strong> {currentReason}</div>
                )}
              </div>
            )}
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

            <div className="space-y-2">
              <Label htmlFor="reason">Reason (Optional)</Label>
              <Textarea
                id="reason"
                value={statusReason}
                onChange={(e) => setStatusReason(e.target.value)}
                placeholder="Provide a reason for this status change (e.g., rejection reason, postponement details)..."
                className="min-h-[80px]"
              />
              <p className="text-xs text-gray-500">
                This field is especially useful for rejected or postponed applications.
              </p>
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={handleClose}>
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
