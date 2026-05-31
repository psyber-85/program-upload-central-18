// Patch 1.4 §6/§19 — attachment metadata viewer for request detail.
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { requestRepo, type RequestAttachment } from '@/lib/internal-hub/repos/requestRepo';
import { Button } from '@/components/ui/button';
import { ExternalLink, Paperclip } from 'lucide-react';
import { toast } from 'sonner';

const AttachmentList: React.FC<{ requestId: string }> = ({ requestId }) => {
  const { data: list = [], isLoading } = useQuery({
    queryKey: ['ih-request-attachments', requestId],
    queryFn: () => requestRepo.listAttachments(requestId),
  });

  async function open(att: RequestAttachment) {
    const url = await requestRepo.signedUrl(att.path);
    if (url) window.open(url, '_blank');
    else toast.error('Could not open file');
  }

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading attachments…</p>;
  if (list.length === 0) return <p className="text-sm text-muted-foreground">No attachments.</p>;

  return (
    <ul className="space-y-1">
      {list.map((a) => (
        <li key={a.id} className="flex items-center justify-between gap-2 text-sm">
          <div className="flex items-center gap-2 min-w-0">
            <Paperclip className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span className="truncate">{a.path.split('/').pop()}</span>
            <span className="text-xs text-muted-foreground shrink-0">
              {(a.size / 1024).toFixed(0)} KB · {a.kind}
            </span>
          </div>
          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => open(a)}>
            Open <ExternalLink className="h-3 w-3 ml-1" />
          </Button>
        </li>
      ))}
    </ul>
  );
};

export default AttachmentList;
