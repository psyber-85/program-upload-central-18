import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

export interface SummaryCardProps {
  title: string;
  value: string | number;
  caption?: string;
  tone?: 'default' | 'attention' | 'success' | 'muted';
  icon?: LucideIcon;
  to?: string;
}

const toneClass: Record<NonNullable<SummaryCardProps['tone']>, string> = {
  default: 'bg-primary',
  attention: 'bg-destructive',
  success: 'bg-emerald-500',
  muted: 'bg-muted-foreground',
};

const SummaryCard = ({ title, value, caption, tone = 'default', icon: Icon, to }: SummaryCardProps) => {
  const body = (
    <CardContent className="p-4 flex items-start gap-3">
      <span className={cn('mt-1 h-2 w-2 rounded-full shrink-0', toneClass[tone])} aria-hidden />
      <div className="min-w-0 flex-1">
        <div className="text-xs uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
          {Icon && <Icon className="h-3.5 w-3.5" />}
          <span className="truncate">{title}</span>
        </div>
        <div className="text-2xl font-semibold text-foreground mt-1 leading-tight">{value}</div>
        {caption && <div className="text-xs text-muted-foreground mt-1">{caption}</div>}
      </div>
    </CardContent>
  );
  return to ? (
    <Link to={to} className="block">
      <Card className="hover:bg-accent/40 transition-colors">{body}</Card>
    </Link>
  ) : (
    <Card>{body}</Card>
  );
};

export default SummaryCard;
