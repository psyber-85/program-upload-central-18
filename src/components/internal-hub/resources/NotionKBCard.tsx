import React from 'react';
import { Lock, Unlock, ExternalLink } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { isNotionUnlocked, notionUnlockDate } from '@/lib/internal-hub/lifecycle';

interface Props {
  joinDate: string;
  granted?: boolean;
  link?: string;
}

const NotionKBCard = ({ joinDate, granted, link = 'https://www.notion.so/aihq' }: Props) => {
  const unlocked = isNotionUnlocked(joinDate);
  const unlockOn = notionUnlockDate(joinDate);

  return (
    <Card id="notion-kb" className="p-4 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        {unlocked ? <Unlock className="h-4 w-4 text-primary" /> : <Lock className="h-4 w-4 text-muted-foreground" />}
        <div className="text-sm font-medium text-foreground">Notion Knowledge Base</div>
      </div>
      {!unlocked ? (
        <p className="text-xs text-muted-foreground">
          Notion access unlocks on <span className="font-medium">{unlockOn.toLocaleDateString()}</span>,
          one month after your join date.
        </p>
      ) : granted ? (
        <>
          <p className="text-xs text-muted-foreground">Access granted. Open the workspace below.</p>
          <Button asChild size="sm">
            <a href={link} target="_blank" rel="noopener noreferrer">
              Open Notion KB <ExternalLink className="h-3.5 w-3.5 ml-1" />
            </a>
          </Button>
        </>
      ) : (
        <p className="text-xs text-muted-foreground">
          Eligible. Admin will provision your Notion workspace access via the access checklist.
        </p>
      )}
    </Card>
  );
};

export default NotionKBCard;
