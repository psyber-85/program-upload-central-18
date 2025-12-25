import { BarChart3, Download, Calendar, TrendingUp, Users, Briefcase } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function OpsReports() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Reports</h1>
          <p className="text-muted-foreground">Analytics and performance metrics</p>
        </div>
        <Button variant="outline"><Download className="h-4 w-4 mr-2" />Export</Button>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card><CardContent className="pt-4"><div className="flex items-center gap-2"><Briefcase className="h-4 w-4 text-blue-600" /><span className="text-sm text-muted-foreground">Active Roles</span></div><p className="text-2xl font-bold mt-1">24</p><p className="text-xs text-green-600">+12% this month</p></CardContent></Card>
        <Card><CardContent className="pt-4"><div className="flex items-center gap-2"><Users className="h-4 w-4 text-purple-600" /><span className="text-sm text-muted-foreground">Submissions</span></div><p className="text-2xl font-bold mt-1">156</p><p className="text-xs text-green-600">+8% this month</p></CardContent></Card>
        <Card><CardContent className="pt-4"><div className="flex items-center gap-2"><TrendingUp className="h-4 w-4 text-emerald-600" /><span className="text-sm text-muted-foreground">Placements</span></div><p className="text-2xl font-bold mt-1">18</p><p className="text-xs text-green-600">+5 this month</p></CardContent></Card>
      </div>

      <Card><CardHeader><CardTitle>Placement Trends</CardTitle></CardHeader><CardContent><div className="h-64 flex items-center justify-center text-muted-foreground"><BarChart3 className="h-12 w-12" /></div></CardContent></Card>
    </div>
  );
}
