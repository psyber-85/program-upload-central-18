import React from 'react';
import { Badge } from '@/components/ui/badge';
import type { NoticeImportance, NoticeType } from '@/lib/internal-hub/types';
import { NOTICE_IMPORTANCE_LABELS, NOTICE_TYPE_LABELS } from '@/lib/internal-hub/types';

export const NoticeImportanceBadge = ({ importance }: { importance: NoticeImportance }) => {
  if (importance === 'AcknowledgmentRequired') {
    return <Badge variant="destructive">{NOTICE_IMPORTANCE_LABELS[importance]}</Badge>;
  }
  if (importance === 'Important') {
    return <Badge variant="secondary">{NOTICE_IMPORTANCE_LABELS[importance]}</Badge>;
  }
  return <Badge variant="outline">{NOTICE_IMPORTANCE_LABELS[importance]}</Badge>;
};

export const NoticeTypeBadge = ({ type }: { type: NoticeType }) => (
  <Badge variant="outline" className="text-[10px]">{NOTICE_TYPE_LABELS[type]}</Badge>
);
