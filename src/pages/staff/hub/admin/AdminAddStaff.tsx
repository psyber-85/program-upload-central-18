import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!values.fullName || !values.email) {
      toast({ title: 'Name and email are required', variant: 'destructive' });
      return;
    }
    const created = staffRepo.create(values);
    // Doc 0.2 §7 — initialize lifecycle artefacts.
    onboardingRepo.init(created.id);
    toolAccessRepo.init(created.id);
    welcomeEmailRepo.queue(created.id);
    toast({ title: 'Staff created', description: `${created.fullName} is Active. Onboarding initialized.` });
    navigate(`/staff/admin/staff/${created.id}`);
  };

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto">
      <header className="mb-4">
        <h1 className="text-2xl font-semibold text-foreground">Add staff</h1>
        <p className="text-sm text-muted-foreground mt-1">
          New staff become Active with onboarding in progress. No passwords are stored anywhere.
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
          <Button type="button" variant="outline" onClick={() => navigate('/staff/admin/staff')}>Cancel</Button>
          <Button type="submit">Create staff</Button>
        </div>
      </form>
    </div>
  );
};

export default AdminAddStaff;
