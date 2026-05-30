import React, { useState } from 'react';
import { Mail, Copy, Check } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { IT_SUPPORT_EMAIL } from '@/lib/internal-hub/types';

const ITSupportCard = () => {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(IT_SUPPORT_EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* ignore */ }
  };
  return (
    <Card className="p-4 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Mail className="h-4 w-4 text-primary" />
        <div className="text-sm font-medium text-foreground">IT Support</div>
      </div>
      <p className="text-xs text-muted-foreground">
        For tools, access, or account issues, email IT support. No tickets, no SLAs — just email.
      </p>
      <div className="flex flex-col sm:flex-row gap-2">
        <Button asChild size="sm" variant="default">
          <a href={`mailto:${IT_SUPPORT_EMAIL}`}>Email {IT_SUPPORT_EMAIL}</a>
        </Button>
        <Button size="sm" variant="outline" onClick={copy}>
          {copied ? <Check className="h-3.5 w-3.5 mr-1" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
          {copied ? 'Copied' : 'Copy email'}
        </Button>
      </div>
    </Card>
  );
};

export default ITSupportCard;
