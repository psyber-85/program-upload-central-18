import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import {
  FileText, BookOpen, Receipt, Banknote, Users, Settings as SettingsIcon, LucideIcon, Megaphone,
} from 'lucide-react';

interface SectionTile {
  label: string;
  to: string;
  icon: LucideIcon;
  adminOnly?: boolean;
  external?: boolean;
}

const SectionsGrid = ({ isAdmin }: { isAdmin: boolean }) => {
  const tiles: SectionTile[] = [
    { label: 'Requests', to: '/staff/requests', icon: FileText },
    { label: 'Resources', to: '/staff/resources', icon: BookOpen },
    { label: 'My Payslips', to: '/staff/payslips', icon: Receipt },
    { label: 'Payroll', to: '/staff/admin/payroll', icon: Banknote, adminOnly: true },
    { label: 'Staff', to: '/staff/admin/staff', icon: Users, adminOnly: true },
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
              <div className="min-w-0">
                <div className="text-sm font-medium text-foreground truncate">{t.label}</div>
                {t.external && (
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
