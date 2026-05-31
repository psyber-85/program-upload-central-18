// Doc 4.2 §14 — Admin chooses the single shared team calendar used for Leave/MC sync.
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

interface CalendarOption { id: string; summary: string; primary?: boolean }

export default function CalendarSettings() {
  const [enabled, setEnabled] = useState(false);
  const [calendarId, setCalendarId] = useState<string>('');
  const [calendars, setCalendars] = useState<CalendarOption[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);

  async function loadConfig() {
    const { data } = await supabase.from('ih_calendar_config').select('*').eq('id', 1).maybeSingle();
    if (data) {
      setEnabled(!!data.enabled);
      setCalendarId(data.calendar_id ?? '');
    }
  }

  async function loadLogs() {
    const { data } = await supabase
      .from('ih_calendar_sync_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);
    setRecentLogs(data ?? []);
  }

  async function listCalendars() {
    setLoadingList(true);
    try {
      const { data, error } = await supabase.functions.invoke('ih-calendar-list', { body: {} });
      if (error) throw error;
      setCalendars((data?.items ?? []) as CalendarOption[]);
    } catch (e) {
      toast.error('Could not list calendars: ' + (e as Error).message);
    } finally {
      setLoadingList(false);
    }
  }

  async function save() {
    const { error } = await supabase
      .from('ih_calendar_config')
      .update({ enabled, calendar_id: calendarId || null, updated_at: new Date().toISOString() })
      .eq('id', 1);
    if (error) toast.error(error.message);
    else toast.success('Calendar settings saved.');
  }

  useEffect(() => { loadConfig(); loadLogs(); }, []);

  const boundCalendar = calendars.find((c) => c.id === calendarId);
  const boundName = boundCalendar?.summary
    ?? (calendarId === '9a7578ab724e69ac2a18fc646c33c684a7b94a2c420127f1069284936486e78c@group.calendar.google.com'
      ? '[AIHQ] Team Calendar'
      : null);

  return (
    <div className="space-y-6 p-4">
      <Card>
        <CardHeader>
          <CardTitle>Team Calendar Sync</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {calendarId && (
            <div className="rounded-md border border-primary/30 bg-primary/5 px-3 py-2 text-sm">
              <span className="text-muted-foreground">Currently syncing to:</span>{' '}
              <strong>{boundName ?? 'Custom calendar'}</strong>
              <div className="text-xs text-muted-foreground break-all mt-0.5">{calendarId}</div>
            </div>
          )}
          <div className="flex items-center gap-3">
            <Switch checked={enabled} onCheckedChange={setEnabled} />
            <span className="text-sm">Sync approved Leave / accepted MC to the shared team calendar</span>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Calendar ID</label>
            <div className="flex gap-2">
              <input
                className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="e.g. team@theaihq.net or a long Google calendar id"
                value={calendarId}
                onChange={(e) => setCalendarId(e.target.value)}
              />
              <Button variant="outline" onClick={listCalendars} disabled={loadingList}>
                {loadingList ? 'Loading…' : 'List my calendars'}
              </Button>
            </div>
            {calendars.length > 0 && (
              <div className="rounded-md border bg-muted/30 p-2 text-sm space-y-1 max-h-48 overflow-auto">
                {calendars.map((c) => (
                  <button
                    key={c.id}
                    className="block w-full text-left px-2 py-1 rounded hover:bg-accent"
                    onClick={() => setCalendarId(c.id)}
                  >
                    {c.summary} {c.primary ? '(primary)' : ''}
                    <span className="block text-xs text-muted-foreground">{c.id}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-md bg-muted/40 border p-3 text-xs text-muted-foreground">
            Calendar events only show <strong>"&lt;Name&gt; — Leave/MC"</strong> and dates.
            Reasons, medical notes, and attachments are never sent.
          </div>

          <Button onClick={save}>Save</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent sync activity</CardTitle>
        </CardHeader>
        <CardContent>
          {recentLogs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No sync activity yet.</p>
          ) : (
            <div className="text-sm divide-y">
              {recentLogs.map((l) => (
                <div key={l.id} className="py-2 flex items-center justify-between">
                  <div>
                    <span className={
                      l.status === 'success' ? 'text-green-600' :
                      l.status === 'failed' ? 'text-red-600' : 'text-muted-foreground'
                    }>
                      {l.status}
                    </span>
                    <span className="ml-2 text-xs text-muted-foreground">
                      {l.action} • {new Date(l.created_at).toLocaleString()}
                    </span>
                    {l.error_message && (
                      <div className="text-xs text-red-600 mt-1">{l.error_message}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
