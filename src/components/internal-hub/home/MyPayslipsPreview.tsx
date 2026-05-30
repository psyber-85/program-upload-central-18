import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Receipt } from 'lucide-react';
import type { Payslip } from '@/lib/internal-hub/types';

const MyPayslipsPreview = ({ items }: { items: Payslip[] }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-base">My Payslips</CardTitle>
      <Button asChild variant="ghost" size="sm" className="h-7 text-xs">
        <Link to="/staff/payslips">View all</Link>
      </Button>
    </CardHeader>
    <CardContent className="pt-0">
      {items.length === 0 ? (
        <div className="py-6 flex flex-col items-center text-center gap-2">
          <Receipt className="h-6 w-6 text-muted-foreground" />
          <div className="text-sm text-muted-foreground">No payslips available yet</div>
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {items.map((p) => (
            <li key={p.id} className="py-2.5 flex items-center justify-between text-sm">
              <Link to={`/staff/payslips/${p.id}`} className="text-foreground hover:underline">
                {p.month}
              </Link>
              <span className="text-xs text-muted-foreground">{p.availability}</span>
            </li>
          ))}
        </ul>
      )}
    </CardContent>
  </Card>
);

export default MyPayslipsPreview;
