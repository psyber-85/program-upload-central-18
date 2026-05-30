import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useHub } from '@/lib/internal-hub/HubContext';
import { noticeRepo } from '@/lib/internal-hub';
import { canAccessAdminArea } from '@/lib/internal-hub/access';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, ExternalLink, Archive, Edit, Check, ClipboardList } from 'lucide-react';
import { NoticeImportanceBadge, NoticeTypeBadge } from '@/components/internal-hub/notices/NoticeBadges';
import { useToast } from '@/hooks/use-toast';

const NoticeDetail = () => {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { currentStaff } = useHub();
  const isAdmin = canAccessAdminArea(currentStaff);
  const { toast } = useToast();
  const [tick, setTick] = useState(0);
  const [editing, setEditing] = useState(false);

  const notice = useMemo(() => noticeRepo.get(id), [id, tick]);

  // Mark read on open
  useEffect(() => {
    if (notice && currentStaff) noticeRepo.markRead(notice.id, currentStaff.id);
  }, [notice?.id, currentStaff?.id]);

  if (!currentStaff) return null;
  if (!notice) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <p className="text-sm text-muted-foreground">Notice not found.</p>
        <Button asChild variant="link" className="px-0"><Link to="/staff/notices">Back to Notices</Link></Button>
      </div>
    );
  }

  const ack = noticeRepo.ackBy(notice.id, currentStaff.id);

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
            {notice.editedAt && ` · edited ${new Date(notice.editedAt).toLocaleString()}`}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {editing && isAdmin ? (
            <EditForm notice={notice} onDone={() => { setEditing(false); setTick((t) => t + 1); }} />
          ) : (
            <p className="text-sm text-foreground whitespace-pre-wrap">{notice.message}</p>
          )}

          {notice.links.length > 0 && (
            <div className="space-y-1">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Links</div>
              {notice.links.map((l, i) => (
                <a key={i} href={l.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline inline-flex items-center gap-1">
                  {l.label || l.url} <ExternalLink className="h-3 w-3" />
                </a>
              ))}
            </div>
          )}

          {notice.importance === 'AcknowledgmentRequired' && (
            <div className="border-t border-border pt-4">
              {ack ? (
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-500" />
                  Acknowledged on {new Date(ack.acknowledgedAt).toLocaleString()}
                </div>
              ) : (
                <Button
                  onClick={() => {
                    noticeRepo.acknowledge(notice.id, currentStaff.id);
                    setTick((t) => t + 1);
                    toast({ title: 'Acknowledged', description: 'Thanks — your acknowledgment is recorded.' });
                  }}
                >
                  Acknowledge
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
              {!notice.archived ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { noticeRepo.archive(notice.id); setTick((t) => t + 1); toast({ title: 'Notice archived' }); }}
                >
                  <Archive className="h-3.5 w-3.5 mr-1" />Archive
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { noticeRepo.unarchive(notice.id); setTick((t) => t + 1); }}
                >
                  Restore
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const EditForm = ({ notice, onDone }: { notice: ReturnType<typeof noticeRepo.get>; onDone: () => void }) => {
  const n = notice!;
  const [title, setTitle] = useState(n.title);
  const [message, setMessage] = useState(n.message);
  const [linksText, setLinksText] = useState(
    n.links.map((l) => `${l.label}|${l.url}`).join('\n'),
  );
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
      <div>
        <label className="text-xs text-muted-foreground">Links (one per line, label|url)</label>
        <Textarea rows={3} value={linksText} onChange={(e) => setLinksText(e.target.value)} />
      </div>
      <p className="text-xs text-muted-foreground">
        Edits are limited to title, message, and links. Material changes should be re-broadcast instead.
      </p>
      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={() => {
            const links = linksText
              .split('\n')
              .map((l) => l.trim())
              .filter(Boolean)
              .map((l) => {
                const [label, url] = l.split('|');
                return { label: (label ?? '').trim(), url: (url ?? label ?? '').trim() };
              })
              .filter((l) => l.url);
            noticeRepo.edit(n.id, { title, message, links });
            onDone();
          }}
        >Save</Button>
        <Button size="sm" variant="ghost" onClick={onDone}>Cancel</Button>
      </div>
    </div>
  );
};

export default NoticeDetail;
