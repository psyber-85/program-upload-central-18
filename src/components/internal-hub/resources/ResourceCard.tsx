import React from 'react';
import { ExternalLink, Mail } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Resource } from '@/lib/internal-hub/types';

const ResourceCard = ({ resource }: { resource: Resource }) => {
  const isMail = resource.link.startsWith('mailto:');
  const external = !!resource.external || resource.link.startsWith('http');
  const target = external && !isMail ? '_blank' : undefined;
  const rel = external && !isMail ? 'noopener noreferrer' : undefined;

  return (
    <a href={resource.link} target={target} rel={rel} className="block">
      <Card className="p-4 hover:bg-accent/40 transition-colors h-full flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <div className="text-sm font-medium text-foreground">{resource.title}</div>
          {isMail ? (
            <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          ) : external ? (
            <ExternalLink className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          ) : null}
        </div>
        {resource.description && (
          <div className="text-xs text-muted-foreground line-clamp-3">{resource.description}</div>
        )}
        {resource.isNew && (
          <div className="mt-auto"><Badge variant="secondary" className="text-[10px]">New</Badge></div>
        )}
      </Card>
    </a>
  );
};

export default ResourceCard;
