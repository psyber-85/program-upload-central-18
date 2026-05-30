import React from 'react';
import { Mail, Send } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { welcomeEmailRepo } from '@/lib/internal-hub/repos/welcomeEmailRepo';
import type { WelcomeEmailEvent } from '@/lib/internal-hub/types';
import { useToast } from '@/hooks/use-toast';

interface Props {
  event?: WelcomeEmailEvent;
  staffId: string;
  onUpdate: () => void;
}

const WelcomeEmailStatus = ({ event, staffId, onUpdate }: Props) => {
  const { toast } = useToast();

  const handleResend = () => {
    welcomeEmailRepo.resend(staffId);
    toast({ title: 'Welcome email resend queued', description: 'No real email sent in dev mode.' });
    onUpdate();
  };

  const handleQueue = () => {
    welcomeEmailRepo.queue(staffId);
    toast({ title: 'Welcome email queued' });
    onUpdate();
  };

  return (
    <div className="flex items-center justify-between gap-3 p-3 rounded-md border border-border bg-card">
      <div className="flex items-center gap-2">
        <Mail className="h-4 w-4 text-muted-foreground" />
        <div>
          <div className="text-sm font-medium text-foreground">Welcome email</div>
          <div className="text-xs text-muted-foreground">
            {event
              ? `Status: ${event.status}${event.sentAt ? ` · ${new Date(event.sentAt).toLocaleString()}` : ''}`
              : 'Not yet queued'}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {event && <Badge variant="outline">{event.status}</Badge>}
        <Button size="sm" variant="outline" onClick={event ? handleResend : handleQueue}>
          <Send className="h-3.5 w-3.5 mr-1" />
          {event ? 'Resend' : 'Queue'}
        </Button>
      </div>
    </div>
  );
};

export default WelcomeEmailStatus;
