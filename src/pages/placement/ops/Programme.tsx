import { GraduationCap, Users, Building2, Award, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function OpsProgramme() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Programme Tracking</h1>
        <p className="text-muted-foreground">Monitor training programmes and placements</p>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-4"><div className="flex items-center gap-2"><Users className="h-4 w-4 text-blue-600" /><span className="text-sm text-muted-foreground">In Training</span></div><p className="text-2xl font-bold mt-1">12</p></CardContent></Card>
        <Card><CardContent className="pt-4"><div className="flex items-center gap-2"><GraduationCap className="h-4 w-4 text-green-600" /><span className="text-sm text-muted-foreground">Graduated</span></div><p className="text-2xl font-bold mt-1">45</p></CardContent></Card>
        <Card><CardContent className="pt-4"><div className="flex items-center gap-2"><Award className="h-4 w-4 text-purple-600" /><span className="text-sm text-muted-foreground">Placed</span></div><p className="text-2xl font-bold mt-1">38</p></CardContent></Card>
        <Card><CardContent className="pt-4"><div className="flex items-center gap-2"><TrendingUp className="h-4 w-4 text-emerald-600" /><span className="text-sm text-muted-foreground">Placement Rate</span></div><p className="text-2xl font-bold mt-1">84%</p></CardContent></Card>
      </div>

      <Card><CardHeader><CardTitle>Active Programmes</CardTitle></CardHeader><CardContent><p className="text-muted-foreground text-center py-8">Programme list will appear here</p></CardContent></Card>
    </div>
  );
}
