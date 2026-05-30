import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import type { LucideIcon } from 'lucide-react';

export interface QuickActionItem {
  label: string;
  icon: LucideIcon;
  to?: string;
  href?: string; // for mailto/external
}

const QuickActionsGrid = ({ items }: { items: QuickActionItem[] }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
    {items.map((it) => {
      const inner = (
        <Card className="p-4 flex flex-col items-center justify-center gap-2 min-h-[88px] text-center hover:bg-accent/40 transition-colors">
          <it.icon className="h-5 w-5 text-primary" />
          <span className="text-sm font-medium text-foreground">{it.label}</span>
        </Card>
      );
      if (it.href) {
        return (
          <a key={it.label} href={it.href} className="block">
            {inner}
          </a>
        );
      }
      return (
        <Link key={it.label} to={it.to ?? '#'} className="block">
          {inner}
        </Link>
      );
    })}
  </div>
);

export default QuickActionsGrid;
