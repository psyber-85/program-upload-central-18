import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Receipt } from 'lucide-react';
import type { Payslip } from '@/lib/internal-hub/types';

const MyPayslipsPreview = ({ items, disabled = false }: { items: Payslip[]; disabled?: boolean }) => {
  const latest = items[0];
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base">My Payslips</CardTitle>
        {!disabled && (
          <Button asChild variant="ghost" size="sm" className="h-7 text-xs">
            <Link to="/staff/payslips">View all</Link>
          </Button>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        {disabled ? (
          <div className="py-6 text-center text-xs text-muted-foreground">
            Payslip access deactivated. Contact HR.
          </div>
        ) : items.length === 0 ? (
          <div className="py-6 flex flex-col items-center text-center gap-2">
            <Receipt className="h-6 w-6 text-muted-foreground" />
            <div className="text-sm text-muted-foreground">No payslips available yet.</div>
          </div>
        ) : (
          <div className="space-y-3">
            {latest && (
              <div className="rounded-md border border-border p-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs text-muted-foreground">Latest</div>
                  <div className="text-sm font-medium text-foreground">{latest.month}</div>
                  <div className="text-xs text-muted-foreground">{latest.availability}</div>
                </div>
                <Button asChild size="sm">
                  <Link to={`/staff/payslips/${latest.id}`}>View Payslip</Link>
                </Button>
              </div>
            )}
            {items.length > 1 && (
              <ul className="divide-y divide-border">
                {items.slice(1).map((p) => (
                  <li key={p.id} className="py-2 flex items-center justify-between text-sm">
                    <Link to={`/staff/payslips/${p.id}`} className="text-foreground hover:underline">
                      {p.month}
                    </Link>
                    <span className="text-xs text-muted-foreground">{p.availability}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MyPayslipsPreview;
