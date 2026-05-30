import React from 'react';
import { Lock, Unlock, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { isNotionUnlocked, notionUnlockDate } from '@/lib/internal-hub/lifecycle';

interface Props {
  joinDate: string;
  granted?: boolean;
}

const NotionUnlockBanner = ({ joinDate, granted }: Props) => {
  const unlocked = isNotionUnlocked(joinDate);
  const date = notionUnlockDate(joinDate);
  const dateStr = date.toLocaleDateString();

  let icon = <Lock className="h-5 w-5 text-muted-foreground" />;
  let title = `Notion access unlocks on ${dateStr}`;
  let body = 'Notion KB becomes available 1 month after your join date.';

  if (unlocked && granted) {
    icon = <CheckCircle2 className="h-5 w-5 text-primary" />;
    title = 'Notion access granted';
    body = 'You have access to the Notion knowledge base.';
  } else if (unlocked) {
    icon = <Unlock className="h-5 w-5 text-primary" />;
    title = 'Notion access is eligible';
    body = 'Admin will grant your Notion workspace permission shortly.';
  }

  return (
    <Card>
      <CardContent className="flex items-start gap-3 p-4">
        {icon}
        <div>
          <div className="text-sm font-medium text-foreground">{title}</div>
          <div className="text-xs text-muted-foreground mt-0.5">{body}</div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotionUnlockBanner;
