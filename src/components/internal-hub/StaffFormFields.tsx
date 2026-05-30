import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import type { BusinessArm, HubRole, StaffProfile } from '@/lib/internal-hub/types';

export type StaffFormValues = Omit<StaffProfile, 'id' | 'status' | 'createdAt' | 'updatedAt'>;

interface Props {
  values: StaffFormValues;
  onChange: (patch: Partial<StaffFormValues>) => void;
  // Show salary/EPF/SOCSO + admin notes (admin-only screens)
  showAdminFields?: boolean;
}

const StaffFormFields = ({ values, onChange, showAdminFields = true }: Props) => {
  return (
    <div className="space-y-6">
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="fullName">Full name</Label>
          <Input id="fullName" value={values.fullName} onChange={(e) => onChange({ fullName: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={values.email} onChange={(e) => onChange({ email: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="jobTitle">Job title</Label>
          <Input id="jobTitle" value={values.jobTitle} onChange={(e) => onChange({ jobTitle: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <Label>Role (permission)</Label>
          <Select value={values.role} onValueChange={(v) => onChange({ role: v as HubRole })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Admin">Admin</SelectItem>
              <SelectItem value="Staff">Staff</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Business arm</Label>
          <Select value={values.businessArm} onValueChange={(v) => onChange({ businessArm: v as BusinessArm })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Training">Training</SelectItem>
              <SelectItem value="Solutions">Solutions</SelectItem>
              <SelectItem value="Admin/General">Admin / General</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="joinDate">Join date</Label>
          <Input id="joinDate" type="date" value={values.joinDate} onChange={(e) => onChange({ joinDate: e.target.value })} />
        </div>
      </section>

      {showAdminFields && (
        <section>
          <h3 className="text-sm font-semibold text-foreground mb-3">Payroll settings (admin-only)</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="baseSalary">Base salary</Label>
              <Input id="baseSalary" type="number" value={values.baseSalary}
                onChange={(e) => onChange({ baseSalary: Number(e.target.value) })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="epfRate">EPF rate (%)</Label>
              <Input id="epfRate" type="number" step="0.1" value={values.epfRate}
                onChange={(e) => onChange({ epfRate: Number(e.target.value) })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="socsoRate">SOCSO rate (%)</Label>
              <Input id="socsoRate" type="number" step="0.1" value={values.socsoRate}
                onChange={(e) => onChange({ socsoRate: Number(e.target.value) })} />
            </div>
          </div>
        </section>
      )}

      <section>
        <h3 className="text-sm font-semibold text-foreground mb-3">Insurance</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="space-y-1.5">
            <Label>Covered</Label>
            <div className="h-10 flex items-center">
              <Switch checked={values.insuranceCovered} onCheckedChange={(v) => onChange({ insuranceCovered: v })} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="insStart">Coverage start</Label>
            <Input
              id="insStart"
              type="date"
              value={values.insuranceStartDate ?? ''}
              onChange={(e) => onChange({ insuranceStartDate: e.target.value })}
              disabled={!values.insuranceCovered}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="insLink">Policy link</Label>
            <Input
              id="insLink"
              value={values.insurancePolicyLink ?? ''}
              onChange={(e) => onChange({ insurancePolicyLink: e.target.value })}
              disabled={!values.insuranceCovered}
            />
          </div>
        </div>
      </section>

      {showAdminFields && (
        <section className="space-y-1.5">
          <Label htmlFor="adminNotes">Admin notes</Label>
          <Textarea
            id="adminNotes"
            value={values.adminNotes ?? ''}
            onChange={(e) => onChange({ adminNotes: e.target.value })}
            placeholder="Operational context only. Never store passwords or credentials."
            rows={3}
          />
        </section>
      )}
    </div>
  );
};

export default StaffFormFields;
