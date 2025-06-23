
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Phone } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface LogCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  prospectId: string;
  onComplete: () => void;
}

const LogCallModal: React.FC<LogCallModalProps> = ({
  isOpen,
  onClose,
  prospectId,
  onComplete
}) => {
  const [notes, setNotes] = useState('');
  const [isLogging, setIsLogging] = useState(false);
  const { toast } = useToast();

  const handleLogCall = async () => {
    if (!prospectId) return;
    
    setIsLogging(true);
    try {
      const { error } = await supabase
        .from('prospect_calls')
        .insert([
          {
            prospect_id: prospectId,
            call_date: new Date().toISOString(),
            notes: notes || null
          }
        ]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Call logged successfully",
      });

      onComplete();
      onClose();
      setNotes(''); // Reset form
    } catch (error) {
      console.error('Failed to log call:', error);
      toast({
        title: "Error",
        description: "Failed to log call. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLogging(false);
    }
  };

  const handleClose = () => {
    setNotes('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Phone className="w-5 h-5" />
            Log Call
          </DialogTitle>
          <DialogDescription>
            Record a call with this prospect
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="notes">Call Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Enter any notes about the call..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleLogCall} disabled={isLogging}>
            {isLogging ? 'Logging...' : 'Log Call'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LogCallModal;
