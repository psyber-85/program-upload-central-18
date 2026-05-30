import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import StaffFormFields, { StaffFormValues } from '@/components/internal-hub/StaffFormFields';
import { staffRepo } from '@/lib/internal-hub/repos/staffRepo';
import { onboardingRepo } from '@/lib/internal-hub/repos/onboardingRepo';
import { toolAccessRepo } from '@/lib/internal-hub/repos/toolAccessRepo';
import { welcomeEmailRepo } from '@/lib/internal-hub/repos/welcomeEmailRepo';
import { useToast } from '@/hooks/use-toast';

const empty: StaffFormValues = {
  fullName: '',
  email: '',
  role: 'Staff',
  jobTitle: '',
  businessArm: 'Training',
  joinDate: new Date().toISOString().slice(0, 10),
  baseSalary: 0,
  epfRate: 11,
  socsoRate: 0.5,
  insuranceCovered: false,
};

const AdminAddStaff = () => {
  const [values, setValues] = useState<StaffFormValues>(empty);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!values.fullName || !values.email) {
      toast({ title: 'Name and email are required', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      const created = await staffRepo.create(values);
      // Doc 0.2 §7 — initialize lifecycle artefacts (still local until Sub-batch 2D).
      onboardingRepo.init(created.id);
      toolAccessRepo.init(created.id);
      welcomeEmailRepo.queue(created.id);
      toast({ title: 'Staff invited', description: `${created.fullName} will receive an email invite.` });
      queryClient.invalidateQueries({ queryKey: ['ih-staff-list'] });
      navigate(`/staff/admin/staff/${created.id}`);
    } catch (err) {
      toast({ title: 'Create failed', description: String((err as Error).message), variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto">
      <header className="mb-4">
        <h1 className="text-2xl font-semibold text-foreground">Add staff</h1>
        <p className="text-sm text-muted-foreground mt-1">
          New staff receive an email invite. No passwords are stored anywhere.
        </p>
      </header>
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader><CardTitle className="text-base">Profile</CardTitle></CardHeader>
          <CardContent>
            <StaffFormFields values={values} onChange={(p) => setValues((v) => ({ ...v, ...p }))} />
          </CardContent>
        </Card>
        <div className="mt-4 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => navigate('/staff/admin/staff')} disabled={submitting}>Cancel</Button>
          <Button type="submit" disabled={submitting}>
            {submitting && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
            Create staff
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AdminAddStaff;
