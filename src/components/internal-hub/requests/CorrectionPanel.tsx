// Patch 1.4 §11/§12 — Needs Correction guidance + resubmit action.
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, RotateCcw } from 'lucide-react';

interface Props {
  adminNote: string | null;
  canResubmit: boolean;
  resubmitting?: boolean;
  onResubmit: () => void;
}

const CorrectionPanel: React.FC<Props> = ({ adminNote, canResubmit, resubmitting, onResubmit }) => (
  <Alert variant="destructive" className="border-destructive/40">
    <AlertCircle className="h-4 w-4" />
    <AlertTitle>Needs Correction</AlertTitle>
    <AlertDescription className="space-y-3">
      <div>
        <p className="text-sm font-medium text-foreground">Admin comment</p>
        <p className="text-sm text-foreground/90 whitespace-pre-wrap">
          {adminNote?.trim() || 'No specific instructions were provided. Please review and resubmit.'}
        </p>
      </div>
      <p className="text-xs text-muted-foreground">
        Update the fields above (and any attachments), then resubmit. The same request will be reused — no
        duplicate will be created.
      </p>
      <Button onClick={onResubmit} disabled={!canResubmit || resubmitting} size="sm">
        <RotateCcw className="h-3.5 w-3.5 mr-1" />
        {resubmitting ? 'Resubmitting…' : 'Resubmit Request'}
      </Button>
    </AlertDescription>
  </Alert>
);

export default CorrectionPanel;
