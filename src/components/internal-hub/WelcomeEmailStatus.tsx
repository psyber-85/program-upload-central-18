import React, { useState } from 'react';
import { Mail, Send, Loader2 } from 'lucide-react';
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
  const [isSending, setIsSending] = useState(false);

  const runSend = async (action: 'queue' | 'resend') => {
    setIsSending(true);
    try {
      const result =
        action === 'resend'
          ? await welcomeEmailRepo.resend(staffId)
          : await welcomeEmailRepo.queue(staffId);

      if (result.status === 'sent' || result.status === 'resent') {
        toast({
          title: action === 'resend' ? 'Welcome email resent' : 'Welcome email sent',
          description: `Delivered to staff inbox via SendGrid.`,
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Failed to send welcome email',
          description: 'Check System Issues for details.',
        });
      }
    } catch (e) {
      toast({
        variant: 'destructive',
        title: 'Failed to send welcome email',
        description: e instanceof Error ? e.message : 'Unknown error',
      });
    } finally {
      setIsSending(false);
      onUpdate();
    }
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
        <Button
          size="sm"
          variant="outline"
          disabled={isSending}
          onClick={() => runSend(event ? 'resend' : 'queue')}
        >
          {isSending ? (
            <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
          ) : (
            <Send className="h-3.5 w-3.5 mr-1" />
          )}
          {event ? 'Resend' : 'Queue'}
        </Button>
      </div>
    </div>
  );
};

export default WelcomeEmailStatus;
