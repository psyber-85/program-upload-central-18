import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CloseReasonType } from '@/lib/placement/types';

interface SafeExitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason: CloseReasonType, notes?: string) => void;
  context?: 'interview' | 'loi' | 'training' | 'general';
}

const reasonOptions: { value: CloseReasonType; label: string; description: string }[] = [
  {
    value: 'not_proceeding_fit',
    label: 'Not the right fit',
    description: 'Skills, experience, or requirements don\'t align',
  },
  {
    value: 'withdrawn',
    label: 'Requirements changed',
    description: 'Business needs or timeline have changed',
  },
  {
    value: 'replaced',
    label: 'Exploring alternatives',
    description: 'Would like to review other candidates',
  },
  {
    value: 'other',
    label: 'Other reason',
    description: 'Please provide details below',
  },
];

export function SafeExitDialog({
  open,
  onOpenChange,
  onConfirm,
  context = 'general',
}: SafeExitDialogProps) {
  const [selectedReason, setSelectedReason] = useState<CloseReasonType>('not_proceeding_fit');
  const [notes, setNotes] = useState('');

  const handleConfirm = () => {
    onConfirm(selectedReason, notes || undefined);
    setSelectedReason('not_proceeding_fit');
    setNotes('');
    onOpenChange(false);
  };

  const getTitle = () => {
    switch (context) {
      case 'interview':
        return 'Not Proceeding After Interview';
      case 'loi':
        return 'Not Proceeding to LOI';
      case 'training':
        return 'Not Proceeding to Hire';
      default:
        return 'Not Proceeding';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
          <DialogDescription>
            Let us know why you've decided not to proceed. This helps AIHQ coordinate alternatives 
            and improve our matching process.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <RadioGroup
            value={selectedReason}
            onValueChange={(value) => setSelectedReason(value as CloseReasonType)}
            className="space-y-3"
          >
            {reasonOptions.map((option) => (
              <div key={option.value} className="flex items-start space-x-3">
                <RadioGroupItem value={option.value} id={option.value} className="mt-1" />
                <Label htmlFor={option.value} className="flex flex-col cursor-pointer">
                  <span className="font-medium">{option.label}</span>
                  <span className="text-sm text-muted-foreground">{option.description}</span>
                </Label>
              </div>
            ))}
          </RadioGroup>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any additional feedback for AIHQ..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[80px]"
            />
          </div>
        </div>

        <div className="bg-muted/50 rounded-lg p-3 text-sm text-muted-foreground">
          <strong>What happens next:</strong> AIHQ will close this match respectfully and may propose 
          alternative candidates if appropriate. This is a normal part of the process.
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
