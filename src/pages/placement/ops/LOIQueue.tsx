import { useState, useEffect } from 'react';
import { FileText, CheckCircle, Clock, Building2, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { roleRepo, loiRepo } from '@/lib/placement/client';
import type { RoleOpening, LOIRecord } from '@/lib/placement/types';

export function LOIQueue() {
  const { toast } = useToast();
  const [roles, setRoles] = useState<RoleOpening[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    const allRoles = await roleRepo.getAll();
    setRoles(allRoles.filter(r => r.loiStatus === 'UPLOADED_SIGNED'));
    setLoading(false);
  }

  async function verifyLOI(role: RoleOpening) {
    try {
      await roleRepo.update(role.id, { loiStatus: 'VERIFIED', loiSignedAt: new Date().toISOString() });
      toast({ title: 'LOI Verified', description: `${role.companyName} - ${role.title}` });
      loadData();
    } catch { toast({ title: 'Error', variant: 'destructive' }); }
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">LOI Queue</h1>
        <p className="text-muted-foreground">Review and verify employer Letters of Intent</p>
      </div>

      <div className="grid gap-4">
        {loading ? [1,2].map(i => <Card key={i} className="animate-pulse"><CardContent className="p-6"><div className="h-6 bg-muted rounded w-1/3" /></CardContent></Card>) : roles.length === 0 ? (
          <Card><CardContent className="py-12 text-center"><CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" /><h3 className="font-semibold">All caught up!</h3><p className="text-muted-foreground">No LOIs pending review</p></CardContent></Card>
        ) : roles.map(role => (
          <Card key={role.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{role.title}</h3>
                    <Badge className="bg-purple-100 text-purple-800">Pending Review</Badge>
                  </div>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span><Building2 className="h-3 w-3 inline mr-1" />{role.companyName}</span>
                    <span><Clock className="h-3 w-3 inline mr-1" />Uploaded recently</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm"><FileText className="h-4 w-4 mr-1" />View</Button>
                  <Button size="sm" onClick={() => verifyLOI(role)}><CheckCircle className="h-4 w-4 mr-1" />Verify</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
