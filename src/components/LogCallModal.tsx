
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Phone } from 'lucide-react';

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
  const [isLogging, setIsLogging] = useState(false);

  const handleLogCall = async () => {
    setIsLogging(true);
    try {
      // TODO: fetch(`/api/prospects/${prospectId}/call`, { method: 'POST' })
      await fetch(`/api/prospects/${prospectId}/call`, {
        method: 'POST'
      });

      onComplete();
      onClose();
    } catch (error) {
      console.error('Failed to log call:', error);
    } finally {
      setIsLogging(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Phone className="w-5 h-5" />
            Log Call
          </DialogTitle>
          <DialogDescription>
            Log a call for this prospect?
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleLogCall} disabled={isLogging}>
            {isLogging ? 'Logging...' : 'Confirm'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LogCallModal;
