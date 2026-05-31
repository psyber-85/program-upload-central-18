// Patch 1.4 §5 — New Request: type selector + per-type form, deep-link via ?type=
import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CalendarPlus, FileHeart, Receipt, GraduationCap, Heart, MoreHorizontal } from 'lucide-react';
import { toast } from 'sonner';
import { useHub } from '@/lib/internal-hub/HubContext';
import { requestRepo, type RequestKind } from '@/lib/internal-hub/repos/requestRepo';
import { staffRepo } from '@/lib/internal-hub/repos/staffRepo';
import LeaveForm from './forms/LeaveForm';
import McForm from './forms/McForm';
import ClaimForm from './forms/ClaimForm';
import TrainingApplicationForm from './forms/TrainingApplicationForm';
import BenefitForm from './forms/BenefitForm';
import OtherRequestForm from './forms/OtherRequestForm';
import type { RequestFormValue } from './forms/formTypes';

type UiType = 'leave' | 'mc' | 'claim' | 'training' | 'insurance' | 'other';

const TYPES: { id: UiType; label: string; icon: React.ComponentType<{ className?: string }>; description: string }[] = [
  { id: 'leave', label: 'Leave', icon: CalendarPlus, description: 'Annual, unpaid, or other leave.' },
  { id: 'mc', label: 'MC Upload', icon: FileHeart, description: 'Submit a medical certificate.' },
  { id: 'claim', label: 'Claim', icon: Receipt, description: 'Expense or reimbursement claim.' },
  { id: 'training', label: 'Training Fund', icon: GraduationCap, description: 'Apply for training reimbursement.' },
  { id: 'insurance', label: 'Insurance / Benefit', icon: Heart, description: 'Insurance or benefit question.' },
  { id: 'other', label: 'Other', icon: MoreHorizontal, description: 'Fallback for admin matters.' },
];

function uiToKind(t: UiType): RequestKind {
  if (t === 'leave') return 'Leave';
  if (t === 'mc') return 'MC';
  if (t === 'claim') return 'Claim';
  if (t === 'training') return 'Training';
  return 'Benefit'; // insurance + other share DB enum
}

const NewRequest: React.FC = () => {
  const { currentStaff } = useHub();
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const t = (params.get('type') as UiType | null) ?? null;

  async function handleSubmit(uiType: UiType, value: RequestFormValue) {
    if (!currentStaff) return;
    const kind = uiToKind(uiType);
    setSubmitting(true);
    try {
      const created = await requestRepo.create({
        staffId: currentStaff.id,
        kind,
        payload: value.payload,
        halfDaySlot: value.halfDaySlot ?? null,
      });
      if (value.file) {
        try {
          await requestRepo.uploadAttachment({
            requestId: created.id,
            staffId: currentStaff.id,
            file: value.file,
            kind: uiType === 'mc' ? 'mc' : uiType === 'claim' ? 'receipt' : 'attachment',
          });
        } catch (e: any) {
          toast.warning(`Submitted, but attachment failed: ${e.message ?? e}`);
        }
      }
      const me = await staffRepo.get(currentStaff.id);
      void requestRepo.notifyAdmins({ request: created, requesterName: me?.fullName ?? 'Staff' });
      toast.success('Request submitted.');
      navigate(`/staff/requests/${created.id}`);
    } catch (e: any) {
      toast.error(e.message ?? String(e));
    } finally {
      setSubmitting(false);
    }
  }

  if (!t) {
    return (
      <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-4">
        <Button asChild variant="ghost" size="sm"><Link to="/staff/requests"><ArrowLeft className="h-4 w-4 mr-1" />Back to Requests</Link></Button>
        <div>
          <h1 className="text-2xl font-semibold">New request</h1>
          <p className="text-sm text-muted-foreground">Choose a request type.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {TYPES.map((opt) => (
            <Card key={opt.id} className="cursor-pointer hover:bg-accent/40 transition-colors" onClick={() => setParams({ type: opt.id })}>
              <CardContent className="p-4 flex items-start gap-3">
                <opt.icon className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <div className="text-sm font-medium">{opt.label}</div>
                  <div className="text-xs text-muted-foreground">{opt.description}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const meta = TYPES.find((x) => x.id === t)!;
  const handler = (v: RequestFormValue) => handleSubmit(t, v);
  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-4">
      <Button asChild variant="ghost" size="sm"><Link to="/staff/requests/new"><ArrowLeft className="h-4 w-4 mr-1" />Change type</Link></Button>
      <Card>
        <CardHeader><CardTitle className="text-lg">{meta.label}</CardTitle></CardHeader>
        <CardContent>
          {t === 'leave' && <LeaveForm onSubmit={handler} submitting={submitting} />}
          {t === 'mc' && <McForm onSubmit={handler} submitting={submitting} />}
          {t === 'claim' && <ClaimForm onSubmit={handler} submitting={submitting} />}
          {t === 'training' && <TrainingApplicationForm onSubmit={handler} submitting={submitting} />}
          {t === 'insurance' && <BenefitForm onSubmit={handler} submitting={submitting} />}
          {t === 'other' && <OtherRequestForm onSubmit={handler} submitting={submitting} />}
        </CardContent>
      </Card>
    </div>
  );
};

export default NewRequest;
