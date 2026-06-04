import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useHub } from '@/lib/internal-hub/HubContext';
import { noticeRepo } from '@/lib/internal-hub';
import type { NoticeAudience, NoticeImportance, NoticeType } from '@/lib/internal-hub/types';
import { NOTICE_TYPE_LABELS } from '@/lib/internal-hub/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type AudienceKey = 'Everyone' | 'Admin' | 'Training' | 'Solutions';

const NOTICE_TYPES: NoticeType[] = [
  'AdminBroadcast',
  'SystemNotification',
  'ResourceUpdate',
  'PayrollNotice',
  'AccessNotice',
  'DeadlineReminder',
  'GeneralAnnouncement',
];

const BroadcastForm = () => {
  const { currentStaff } = useHub();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { toast } = useToast();

  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [audienceKey, setAudienceKey] = useState<AudienceKey>('Everyone');
  const [type, setType] = useState<NoticeType>('AdminBroadcast');
  const [requireAck, setRequireAck] = useState(false);
  const [important, setImportant] = useState(false);

  const broadcastMutation = useMutation({
    mutationFn: () => {
      const audience: NoticeAudience =
        audienceKey === 'Everyone' ? { kind: 'Everyone' }
        : audienceKey === 'Admin' ? { kind: 'Admin' }
        : { kind: 'Arm', arm: audienceKey === 'Training' ? 'Training' : 'Solutions' };
      const importance: NoticeImportance =
        requireAck ? 'AcknowledgmentRequired' : important ? 'Important' : 'Normal';
      return noticeRepo.broadcast({
        title: title.trim(),
        message: message.trim(),
        type,
        importance,
        audience,
        createdBy: currentStaff!.id,
      });
    },
    onSuccess: (n) => {
      qc.invalidateQueries({ queryKey: ['ih-notices'] });
      toast({ title: 'Broadcast published', description: 'In-app notice created and email marked as required.' });
      navigate(`/staff/notices/${n.id}`);
    },
    onError: (e: Error) => toast({ title: 'Publish failed', description: e.message, variant: 'destructive' }),
  });

  if (!currentStaff) return null;

  const submit = () => {
    if (!title.trim() || !message.trim()) {
      toast({ title: 'Missing fields', description: 'Title and message are required.', variant: 'destructive' });
      return;
    }
    broadcastMutation.mutate();
  };

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-4">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link to="/staff/notices"><ArrowLeft className="h-4 w-4 mr-1" />Back</Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Broadcast Notice</CardTitle>
          <p className="text-xs text-muted-foreground inline-flex items-center gap-1.5">
            <Mail className="h-3.5 w-3.5" /> All broadcasts create an in-app notice and mark email as required.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Policy update" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="message">Message</Label>
            <Textarea id="message" rows={6} value={message} onChange={(e) => setMessage(e.target.value)} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as NoticeType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {NOTICE_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>{NOTICE_TYPE_LABELS[t]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Audience</Label>
              <Select value={audienceKey} onValueChange={(v) => setAudienceKey(v as AudienceKey)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Everyone">Everyone</SelectItem>
                  <SelectItem value="Admin">Admin only</SelectItem>
                  <SelectItem value="Training">Training arm</SelectItem>
                  <SelectItem value="Solutions">Solutions arm</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center justify-between rounded-md border border-border p-3">
            <div>
              <div className="text-sm font-medium text-foreground">Mark as Important</div>
              <div className="text-xs text-muted-foreground">Higher visibility, still uses read/unread.</div>
            </div>
            <Switch checked={important} onCheckedChange={setImportant} disabled={requireAck} />
          </div>
          <div className="flex items-center justify-between rounded-md border border-border p-3">
            <div>
              <div className="text-sm font-medium text-foreground">Require acknowledgment</div>
              <div className="text-xs text-muted-foreground">Reserved for serious or record-sensitive items.</div>
            </div>
            <Switch checked={requireAck} onCheckedChange={setRequireAck} />
          </div>
          <div className="flex gap-2 pt-2">
            <Button onClick={submit} disabled={broadcastMutation.isPending}>
              {broadcastMutation.isPending ? 'Publishing…' : 'Publish broadcast'}
            </Button>
            <Button variant="ghost" onClick={() => navigate('/staff/notices')}>Cancel</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BroadcastForm;

