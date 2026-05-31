import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  FileText, BookOpen, Receipt, Banknote, Users, Settings as SettingsIcon, LucideIcon, Megaphone,
} from 'lucide-react';

interface SectionTile {
  label: string;
  to: string;
  icon: LucideIcon;
  adminOnly?: boolean;
  external?: boolean;
  badge?: { text: string; tone?: 'default' | 'attention' };
}

interface Props {
  isAdmin: boolean;
  statuses?: {
    requestsPending?: number;
    noticesAck?: number;
    payslipMonth?: string;
    onboardingPending?: number;
    payrollStatusLabel?: string;
  };
}

const SectionsGrid = ({ isAdmin, statuses = {} }: Props) => {
  const tiles: SectionTile[] = [
    {
      label: 'Requests',
      to: '/staff/requests',
      icon: FileText,
      badge: statuses.requestsPending
        ? { text: `${statuses.requestsPending} pending`, tone: 'attention' }
        : undefined,
    },
    { label: 'Resources', to: '/staff/resources', icon: BookOpen },
    {
      label: 'My Payslips',
      to: '/staff/payslips',
      icon: Receipt,
      badge: statuses.payslipMonth ? { text: statuses.payslipMonth } : undefined,
    },
    {
      label: 'Payroll',
      to: '/staff/admin/payroll',
      icon: Banknote,
      adminOnly: true,
      badge: statuses.payrollStatusLabel ? { text: statuses.payrollStatusLabel } : undefined,
    },
    {
      label: 'Staff',
      to: '/staff/admin/staff',
      icon: Users,
      adminOnly: true,
      badge: statuses.onboardingPending
        ? { text: `${statuses.onboardingPending} onboarding`, tone: 'attention' }
        : undefined,
    },
    { label: 'Settings', to: '/staff/admin/settings', icon: SettingsIcon, adminOnly: true },
    { label: 'Marketing Portal', to: '/staff/marketing', icon: Megaphone, external: true },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {tiles
        .filter((t) => (t.adminOnly ? isAdmin : true))
        .map((t) => (
          <Link key={t.label} to={t.to} className="block">
            <Card className="p-4 flex items-center gap-3 hover:bg-accent/40 transition-colors min-h-[72px]">
              <t.icon className="h-5 w-5 text-primary shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-foreground truncate">{t.label}</div>
                {t.badge && (
                  <Badge
                    variant={t.badge.tone === 'attention' ? 'destructive' : 'secondary'}
                    className="text-[10px] h-4 px-1 mt-1"
                  >
                    {t.badge.text}
                  </Badge>
                )}
                {t.external && !t.badge && (
                  <div className="text-[10px] uppercase tracking-wide text-muted-foreground">External</div>
                )}
              </div>
            </Card>
          </Link>
        ))}
    </div>
  );
};

export default SectionsGrid;
