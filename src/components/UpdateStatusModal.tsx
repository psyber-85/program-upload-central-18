
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
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
  const [currentStatus, setCurrentStatus] = useState('');
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
        .select('registration_status')
        .eq('id', prospectId)
        .single();

      if (error) throw error;

      if (data) {
        setCurrentStatus(data.registration_status || 'Pending');
        setSelectedStatus(data.registration_status || 'Pending');
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
    setCurrentStatus('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Update Registration Status
          </DialogTitle>
          <DialogDescription>
            Change the registration status for this prospect
            {currentStatus && (
              <span className="block mt-1 text-sm">
                Current status: <strong>{currentStatus}</strong>
              </span>
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
