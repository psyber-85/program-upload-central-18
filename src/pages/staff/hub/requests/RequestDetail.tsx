// Patch 1.4 §6/§7/§11/§12/§22/§23/§26/§27 — Request detail page.
import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { useHub } from '@/lib/internal-hub/HubContext';
import { canAccessAdminArea } from '@/lib/internal-hub/access';
import { requestRepo, type RequestKind } from '@/lib/internal-hub/repos/requestRepo';
import { staffRepo } from '@/lib/internal-hub/repos/staffRepo';
import RequestStatusBadge from '@/components/internal-hub/requests/RequestStatusBadge';
import RequestTimeline from '@/components/internal-hub/requests/RequestTimeline';
import AttachmentList from '@/components/internal-hub/requests/AttachmentList';
import CorrectionPanel from '@/components/internal-hub/requests/CorrectionPanel';
import ProofWaiverDialog from '@/components/internal-hub/requests/ProofWaiverDialog';
import LeaveForm from './forms/LeaveForm';
import McForm from './forms/McForm';
import ClaimForm from './forms/ClaimForm';
import TrainingApplicationForm from './forms/TrainingApplicationForm';
import BenefitForm from './forms/BenefitForm';
import OtherRequestForm from './forms/OtherRequestForm';
import TrainingCompletionForm from './forms/TrainingCompletionForm';
import TrainingClaimForm from './forms/TrainingClaimForm';
import type { RequestFormValue } from './forms/formTypes';

function uiTypeFromKind(kind: RequestKind, isOther: boolean): 'leave' | 'mc' | 'claim' | 'training' | 'insurance' | 'other' {
  if (kind === 'Leave') return 'leave';
  if (kind === 'MC') return 'mc';
  if (kind === 'Claim') return 'claim';
  if (kind === 'Training') return 'training';
  return isOther ? 'other' : 'insurance';
}

const RequestDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { currentStaff } = useHub();
  const isAdmin = canAccessAdminArea(currentStaff);
  const [busy, setBusy] = useState(false);
  const [adminNote, setAdminNote] = useState('');

  const { data: row, refetch } = useQuery({
    queryKey: ['ih-request', id],
    queryFn: () => requestRepo.get(id!),
    enabled: !!id,
  });

  const { data: requesterName } = useQuery({
    queryKey: ['ih-staff-name', row?.staff_id],
    queryFn: async () => (await staffRepo.get(row!.staff_id))?.fullName ?? 'Staff',
    enabled: !!row,
  });

  if (!row) return <div className="p-6 text-sm text-muted-foreground">Loading…</div>;
  if (!currentStaff) return null;

  const isOwner = row.staff_id === currentStaff.id;
  const isOther = row.payload?.kind_label === 'Other';
  const uiType = uiTypeFromKind(row.kind, isOther);
  const editable = isOwner && (row.status === 'Submitted' || row.status === 'NeedsCorrection');
  const canDecide = isAdmin && row.status === 'Submitted';
  const showCompletion = isOwner && row.kind === 'Training' && row.status === 'Approved' && row.sub_state === 'ApplicationApproved';
  const showClaim = isOwner && row.kind === 'Training' && row.status === 'Approved' && row.sub_state === 'TrainingCompleted';
  const invalidate = () => { void refetch(); qc.invalidateQueries({ queryKey: ['ih-request-events', id] }); };

  async function handleEditSave(v: RequestFormValue) {
    if (!row || !currentStaff) return;
    setBusy(true);
    try {
      await requestRepo.updatePayload({
        requestId: row.id,
        staffId: currentStaff.id,
        payload: v.payload,
        halfDaySlot: v.halfDaySlot ?? null,
      });
      if (v.file) {
        await requestRepo.uploadAttachment({
          requestId: row.id, staffId: currentStaff.id, file: v.file, kind: 'attachment',
        });
      }
      if (row.status === 'NeedsCorrection') {
        await requestRepo.resubmit({ requestId: row.id, staffId: currentStaff.id });
      }
      toast.success(row.status === 'NeedsCorrection' ? 'Resubmitted.' : 'Updated.');
      invalidate();
    } catch (e: any) {
      toast.error(e.message ?? String(e));
    } finally {
      setBusy(false);
    }
  }

  async function handleDecide(decision: 'Approved' | 'Rejected') {
    if (!row || !currentStaff) return;
    setBusy(true);
    try {
      await requestRepo.decide({ requestId: row.id, decision, note: adminNote || undefined, adminId: currentStaff.id });
      toast.success(`Request ${decision.toLowerCase()}.`);
      setAdminNote('');
      invalidate();
    } catch (e: any) { toast.error(e.message ?? String(e)); }
    finally { setBusy(false); }
  }

  async function handleMarkCorrection() {
    if (!row || !currentStaff) return;
    if (!adminNote.trim()) { toast.error('Comment is required.'); return; }
    setBusy(true);
    try {
      await requestRepo.markNeedsCorrection({ requestId: row.id, note: adminNote, adminId: currentStaff.id });
      toast.success('Marked Needs Correction.');
      setAdminNote('');
      invalidate();
    } catch (e: any) { toast.error(e.message ?? String(e)); }
    finally { setBusy(false); }
  }

  async function handleTrainingCompleted(input: { completionDate: string; note?: string }) {
    if (!row || !currentStaff) return;
    setBusy(true);
    try {
      await requestRepo.markTrainingCompleted({
        requestId: row.id, staffId: currentStaff.id,
        completionDate: input.completionDate, note: input.note,
      });
      toast.success('Training marked completed.');
      invalidate();
    } catch (e: any) { toast.error(e.message ?? String(e)); }
    finally { setBusy(false); }
  }

  async function handleTrainingClaim(input: { amount: number; note?: string; file?: File | null }) {
    if (!row || !currentStaff) return;
    setBusy(true);
    try {
      const claim = await requestRepo.create({
        staffId: currentStaff.id,
        kind: 'Training',
        payload: {
          amount: input.amount,
          reason: input.note,
          course_name: row.payload?.course_name,
          provider: row.payload?.provider,
        },
        trainingApplicationId: row.id,
        subState: 'ClaimSubmitted',
      });
      if (input.file) {
        await requestRepo.uploadAttachment({ requestId: claim.id, staffId: currentStaff.id, file: input.file, kind: 'receipt' });
      }
      const me = await staffRepo.get(currentStaff.id);
      void requestRepo.notifyAdmins({ request: claim, requesterName: me?.fullName ?? 'Staff' });
      toast.success('Training claim submitted.');
      navigate(`/staff/requests/${claim.id}`);
    } catch (e: any) { toast.error(e.message ?? String(e)); }
    finally { setBusy(false); }
  }

  const labelKind = isOther ? 'Other' : row.kind === 'Benefit' ? 'Insurance / Benefit' : row.kind;

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-4">
      <Button asChild variant="ghost" size="sm">
        <Link to={isAdmin ? '/staff/admin/workbench?type=Requests' : '/staff/requests'}>
          <ArrowLeft className="h-4 w-4 mr-1" />Back
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <CardTitle className="text-lg">{labelKind} request</CardTitle>
              <p className="text-xs text-muted-foreground">
                #{row.id.slice(0, 8)} · {requesterName} · Submitted {new Date(row.created_at).toLocaleString()}
              </p>
            </div>
            <RequestStatusBadge status={row.status} kind={row.kind} subState={row.sub_state} />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {row.status === 'NeedsCorrection' && isOwner && (
            <CorrectionPanel
              adminNote={row.decision_note}
              canResubmit={false}
              onResubmit={() => { /* resubmit happens via save in edit form */ }}
            />
          )}

          {row.status !== 'NeedsCorrection' && row.decision_note && (
            <div>
              <Label className="text-xs">Admin comment</Label>
              <p className="text-sm">{row.decision_note}</p>
            </div>
          )}

          {/* Field summary (non-editable view) */}
          <div className="text-sm space-y-1">
            {row.payload?.start_date && <div><span className="text-muted-foreground">Date: </span>{row.payload.start_date}{row.payload.end_date && row.payload.end_date !== row.payload.start_date ? ` → ${row.payload.end_date}` : ''}{row.half_day_slot ? ` · ½ ${row.half_day_slot}` : ''}</div>}
            {row.payload?.amount != null && <div><span className="text-muted-foreground">Amount: </span>MYR {Number(row.payload.amount).toFixed(2)}</div>}
            {row.payload?.category && <div><span className="text-muted-foreground">Category: </span>{String(row.payload.category)}</div>}
            {row.payload?.topic && <div><span className="text-muted-foreground">Topic: </span>{String(row.payload.topic)}</div>}
            {row.payload?.course_name && <div><span className="text-muted-foreground">Course: </span>{String(row.payload.course_name)} {row.payload?.provider ? `(${row.payload.provider})` : ''}</div>}
            {row.payload?.completion_date && <div><span className="text-muted-foreground">Completed: </span>{String(row.payload.completion_date)}</div>}
            {row.payload?.reason && <div><span className="text-muted-foreground">Note: </span>{String(row.payload.reason)}</div>}
            {row.payload?.proof_waived && <div className="text-xs text-muted-foreground">Proof waived: {String(row.payload.proof_waived_reason ?? '')}</div>}
          </div>

          <Separator />
          <div>
            <Label className="text-xs">Attachments</Label>
            <AttachmentList requestId={row.id} />
          </div>

          {editable && (
            <>
              <Separator />
              <div className="space-y-2">
                <Label className="text-sm font-medium">Edit{row.status === 'NeedsCorrection' ? ' & Resubmit' : ''}</Label>
                {uiType === 'leave' && <LeaveForm initial={row.payload} initialHalfDay={row.half_day_slot} onSubmit={handleEditSave} submitLabel={row.status === 'NeedsCorrection' ? 'Resubmit' : 'Save Changes'} submitting={busy} />}
                {uiType === 'mc' && <McForm initial={row.payload} onSubmit={handleEditSave} submitLabel={row.status === 'NeedsCorrection' ? 'Resubmit' : 'Save Changes'} submitting={busy} />}
                {uiType === 'claim' && <ClaimForm initial={row.payload} onSubmit={handleEditSave} submitLabel={row.status === 'NeedsCorrection' ? 'Resubmit' : 'Save Changes'} submitting={busy} />}
                {uiType === 'training' && !row.training_application_id && <TrainingApplicationForm initial={row.payload} onSubmit={handleEditSave} submitLabel={row.status === 'NeedsCorrection' ? 'Resubmit' : 'Save Changes'} submitting={busy} />}
                {uiType === 'insurance' && <BenefitForm initial={row.payload} onSubmit={handleEditSave} submitLabel={row.status === 'NeedsCorrection' ? 'Resubmit' : 'Save Changes'} submitting={busy} />}
                {uiType === 'other' && <OtherRequestForm initial={row.payload} onSubmit={handleEditSave} submitLabel={row.status === 'NeedsCorrection' ? 'Resubmit' : 'Save Changes'} submitting={busy} />}
              </div>
            </>
          )}

          {showCompletion && (
            <>
              <Separator />
              <div className="space-y-2">
                <Label className="text-sm font-medium">Mark training completed</Label>
                <TrainingCompletionForm onSubmit={handleTrainingCompleted} submitting={busy} />
              </div>
            </>
          )}

          {showClaim && (
            <>
              <Separator />
              <div className="space-y-2">
                <Label className="text-sm font-medium">Submit training claim</Label>
                <TrainingClaimForm
                  applicationCost={row.payload?.cost as number | undefined}
                  onSubmit={handleTrainingClaim}
                  submitting={busy}
                />
              </div>
            </>
          )}

          {canDecide && (
            <>
              <Separator />
              <div className="space-y-2">
                <Label className="text-sm font-medium">Admin actions</Label>
                <Textarea value={adminNote} onChange={(e) => setAdminNote(e.target.value)} rows={2} placeholder="Decision / correction comment (required to reject or mark Needs Correction)" />
                <div className="flex gap-2 flex-wrap">
                  <Button size="sm" disabled={busy} onClick={() => handleDecide('Approved')}>
                    <Check className="h-4 w-4 mr-1" />{row.kind === 'MC' ? 'Accept / Record' : 'Approve'}
                  </Button>
                  <Button size="sm" variant="destructive" disabled={busy} onClick={() => handleDecide('Rejected')}>
                    <X className="h-4 w-4 mr-1" />Reject
                  </Button>
                  <Button size="sm" variant="outline" disabled={busy} onClick={handleMarkCorrection}>
                    Mark Needs Correction
                  </Button>
                  {(row.kind === 'Claim' || row.kind === 'Training') && (
                    <ProofWaiverDialog requestId={row.id} adminId={currentStaff.id} alreadyWaived={!!row.payload?.proof_waived} onDone={invalidate} />
                  )}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Activity</CardTitle></CardHeader>
        <CardContent><RequestTimeline requestId={row.id} /></CardContent>
      </Card>
    </div>
  );
};

export default RequestDetail;
