import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { resourceRepo } from '@/lib/internal-hub';
import { RESOURCE_CATEGORY_LABELS, type Resource, type ResourceCategory } from '@/lib/internal-hub/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Plus, Archive, RotateCcw, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const CATEGORIES = Object.keys(RESOURCE_CATEGORY_LABELS) as ResourceCategory[];

const blank = {
  title: '',
  category: 'CompanyTools' as ResourceCategory,
  link: '',
  description: '',
};

const ManageResources = () => {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data: all = [], isLoading } = useQuery({
    queryKey: ['ih-resources-all'],
    queryFn: () => resourceRepo.list(),
  });
  const [editing, setEditing] = useState<Resource | null>(null);
  const [draft, setDraft] = useState(blank);

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['ih-resources-all'] });
    qc.invalidateQueries({ queryKey: ['ih-resources-visible'] });
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editing) {
        return resourceRepo.update(editing.id, { ...draft });
      }
      return resourceRepo.create({
        ...draft,
        audience: { kind: 'Everyone' },
        external: draft.link.startsWith('http'),
        isNew: true,
      });
    },
    onSuccess: () => {
      toast({ title: editing ? 'Resource updated' : 'Resource added' });
      setEditing(null);
      setDraft(blank);
      invalidate();
    },
    onError: (e: Error) => toast({ title: 'Save failed', description: e.message, variant: 'destructive' }),
  });

  const archiveMutation = useMutation({
    mutationFn: ({ id, archived }: { id: string; archived: boolean }) =>
      archived ? resourceRepo.unarchive(id) : resourceRepo.archive(id),
    onSuccess: () => invalidate(),
    onError: (e: Error) => toast({ title: 'Failed', description: e.message, variant: 'destructive' }),
  });

  const startNew = () => { setEditing(null); setDraft(blank); };
  const startEdit = (r: Resource) => {
    setEditing(r);
    setDraft({ title: r.title, category: r.category, link: r.link, description: r.description ?? '' });
  };

  const save = () => {
    if (!draft.title.trim() || !draft.link.trim()) {
      toast({ title: 'Title and link are required', variant: 'destructive' });
      return;
    }
    saveMutation.mutate();
  };

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-4">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link to="/staff/resources"><ArrowLeft className="h-4 w-4 mr-1" />Back to Resources</Link>
      </Button>

      <header>
        <h1 className="text-2xl font-semibold text-foreground">Manage Resources</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Admin-editable. No passwords, no credentials. Adding a resource does not email staff —
          use Broadcast for important updates.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2"><CardTitle className="text-base">All resources ({all.length})</CardTitle></CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-6 flex items-center text-sm text-muted-foreground"><Loader2 className="h-4 w-4 mr-2 animate-spin" />Loading…</div>
            ) : (
              <ul className="divide-y divide-border">
                {all.map((r) => (
                  <li key={r.id} className="py-2.5 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm text-foreground truncate">{r.title}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {RESOURCE_CATEGORY_LABELS[r.category]} · {r.link}
                        {r.status === 'Archived' && ' · Archived'}
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button size="sm" variant="ghost" onClick={() => startEdit(r)}>Edit</Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={archiveMutation.isPending}
                        onClick={() => archiveMutation.mutate({ id: r.id, archived: r.status === 'Archived' })}
                      >
                        {r.status === 'Active' ? <Archive className="h-3.5 w-3.5" /> : <RotateCcw className="h-3.5 w-3.5" />}
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{editing ? 'Edit resource' : 'Add resource'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <Label>Title</Label>
              <Input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label>Category</Label>
              <Select value={draft.category} onValueChange={(v) => setDraft({ ...draft, category: v as ResourceCategory })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{RESOURCE_CATEGORY_LABELS[c]}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Link</Label>
              <Input value={draft.link} onChange={(e) => setDraft({ ...draft, link: e.target.value })} placeholder="https://… or mailto:…" />
            </div>
            <div className="space-y-1">
              <Label>Description</Label>
              <Textarea rows={3} value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
            </div>
            <div className="flex gap-2">
              <Button onClick={save} disabled={saveMutation.isPending}>
                <Plus className="h-3.5 w-3.5 mr-1" />{editing ? 'Save' : 'Add'}
              </Button>
              {editing && <Button variant="ghost" onClick={startNew}>Cancel</Button>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ManageResources;
