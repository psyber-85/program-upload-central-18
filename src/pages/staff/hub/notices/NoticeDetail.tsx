import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useHub } from '@/lib/internal-hub/HubContext';
import { noticeRepo } from '@/lib/internal-hub';
import { canAccessAdminArea } from '@/lib/internal-hub/access';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Archive, Edit, Check, ClipboardList, Loader2 } from 'lucide-react';
import { NoticeImportanceBadge, NoticeTypeBadge } from '@/components/internal-hub/notices/NoticeBadges';
import { useToast } from '@/hooks/use-toast';
import type { Notice } from '@/lib/internal-hub/types';

const NoticeDetail = () => {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { currentStaff } = useHub();
  const isAdmin = canAccessAdminArea(currentStaff);
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);

  const { data: notice, isLoading } = useQuery({
    queryKey: ['ih-notice', id],
    queryFn: () => noticeRepo.get(id),
    enabled: !!id,
  });

  const { data: ack } = useQuery({
    queryKey: ['ih-notice-ack', id, currentStaff?.id],
    queryFn: () => noticeRepo.ackBy(id, currentStaff!.id),
    enabled: !!notice && !!currentStaff,
  });

  // Mark read on open
  useEffect(() => {
    if (notice && currentStaff) {
      noticeRepo.markRead(notice.id, currentStaff.id).then(() => {
        qc.invalidateQueries({ queryKey: ['ih-notice-reads', currentStaff.id] });
      });
    }
  }, [notice?.id, currentStaff?.id, qc]);

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['ih-notice', id] });
    qc.invalidateQueries({ queryKey: ['ih-notices'] });
  };

  const ackMutation = useMutation({
    mutationFn: () => noticeRepo.acknowledge(notice!.id, currentStaff!.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ih-notice-ack', id] });
      qc.invalidateQueries({ queryKey: ['ih-notice-acks', currentStaff?.id] });
      toast({ title: 'Acknowledged', description: 'Thanks — your acknowledgment is recorded.' });
    },
    onError: (e: Error) => toast({ title: 'Failed', description: e.message, variant: 'destructive' }),
  });

  const archiveMutation = useMutation({
    mutationFn: (archived: boolean) => (archived ? noticeRepo.unarchive(notice!.id) : noticeRepo.archive(notice!.id)),
    onSuccess: (_d, archived) => {
      invalidate();
      toast({ title: archived ? 'Notice restored' : 'Notice archived' });
    },
    onError: (e: Error) => toast({ title: 'Failed', description: e.message, variant: 'destructive' }),
  });

  if (!currentStaff) return null;
  if (isLoading) {
    return (
      <div className="p-6 max-w-3xl mx-auto flex items-center text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />Loading…
      </div>
    );
  }
  if (!notice) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <p className="text-sm text-muted-foreground">Notice not found.</p>
        <Button asChild variant="link" className="px-0"><Link to="/staff/notices">Back to Notices</Link></Button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-4">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link to="/staff/notices"><ArrowLeft className="h-4 w-4 mr-1" />Back to Notices</Link>
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 flex-wrap">
            <NoticeTypeBadge type={notice.type} />
            <NoticeImportanceBadge importance={notice.importance} />
            {notice.archived && <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Archived</span>}
          </div>
          <CardTitle className="text-xl mt-2">{notice.title}</CardTitle>
          <p className="text-xs text-muted-foreground">
            Published {new Date(notice.publishedAt).toLocaleString()}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {editing && isAdmin ? (
            <EditForm notice={notice} onDone={() => { setEditing(false); invalidate(); }} />
          ) : (
            <p className="text-sm text-foreground whitespace-pre-wrap">{notice.message}</p>
          )}

          {notice.importance === 'AcknowledgmentRequired' && (
            <div className="border-t border-border pt-4">
              {ack ? (
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-500" />
                  Acknowledged on {new Date(ack.acknowledgedAt).toLocaleString()}
                </div>
              ) : (
                <Button onClick={() => ackMutation.mutate()} disabled={ackMutation.isPending}>
                  {ackMutation.isPending ? 'Saving…' : 'Acknowledge'}
                </Button>
              )}
            </div>
          )}

          {isAdmin && !editing && (
            <div className="border-t border-border pt-4 flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                <Edit className="h-3.5 w-3.5 mr-1" />Edit
              </Button>
              {notice.importance === 'AcknowledgmentRequired' && (
                <Button asChild variant="outline" size="sm">
                  <Link to={`/staff/admin/notices/${notice.id}/ack`}>
                    <ClipboardList className="h-3.5 w-3.5 mr-1" />Ack report
                  </Link>
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                disabled={archiveMutation.isPending}
                onClick={() => archiveMutation.mutate(notice.archived)}
              >
                <Archive className="h-3.5 w-3.5 mr-1" />{notice.archived ? 'Restore' : 'Archive'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const EditForm = ({ notice, onDone }: { notice: Notice; onDone: () => void }) => {
  const { toast } = useToast();
  const [title, setTitle] = useState(notice.title);
  const [message, setMessage] = useState(notice.message);
  const editMutation = useMutation({
    mutationFn: () => noticeRepo.edit(notice.id, { title, message }),
    onSuccess: () => { onDone(); toast({ title: 'Notice updated' }); },
    onError: (e: Error) => toast({ title: 'Save failed', description: e.message, variant: 'destructive' }),
  });
  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs text-muted-foreground">Title</label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div>
        <label className="text-xs text-muted-foreground">Message</label>
        <Textarea rows={5} value={message} onChange={(e) => setMessage(e.target.value)} />
      </div>
      <p className="text-xs text-muted-foreground">
        Edits are limited to title and message. Material changes should be re-broadcast instead.
      </p>
      <div className="flex gap-2">
        <Button size="sm" disabled={editMutation.isPending} onClick={() => editMutation.mutate()}>
          {editMutation.isPending ? 'Saving…' : 'Save'}
        </Button>
        <Button size="sm" variant="ghost" onClick={onDone}>Cancel</Button>
      </div>
    </div>
  );
};

export default NoticeDetail;
