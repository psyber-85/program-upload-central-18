import React from 'react';
import { ExternalLink } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Youtube, BookOpen, Wrench } from 'lucide-react';

const StartHereCards = () => {
  const cards = [
    {
      label: 'YouTube Training',
      href: 'https://youtube.com/@aihq',
      icon: Youtube,
      desc: 'Official training playlists',
    },
    {
      label: 'Notion Knowledge Base',
      to: '/staff/resources#notion-kb',
      icon: BookOpen,
      desc: 'Unlocks 1 month after joining',
    },
    {
      label: 'Company Tools',
      to: '/staff/resources#company-tools',
      icon: Wrench,
      desc: 'Links to ChatGPT, Drive, Gemini and more',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {cards.map((c) => {
        const inner = (
          <Card className="p-4 hover:bg-accent/40 transition-colors min-h-[110px] flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <c.icon className="h-5 w-5 text-primary" />
              {'href' in c && <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />}
            </div>
            <div className="text-sm font-medium text-foreground">{c.label}</div>
            <div className="text-xs text-muted-foreground">{c.desc}</div>
          </Card>
        );
        return 'href' in c && c.href ? (
          <a key={c.label} href={c.href} target="_blank" rel="noopener noreferrer">{inner}</a>
        ) : (
          <a key={c.label} href={(c as any).to}>{inner}</a>
        );
      })}
    </div>
  );
};

export default StartHereCards;
