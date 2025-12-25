import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Search, Briefcase, Clock, Star } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { candidateRepo } from '@/lib/placement/client';
import type { CandidateProfile } from '@/lib/placement/types';

const availabilityLabels = { IMMEDIATE: 'Immediate', TWO_WEEKS: '2 Weeks', ONE_MONTH: '1 Month', LONGER: '1+ Month' };

export function OpsCandidates() {
  const [candidates, setCandidates] = useState<CandidateProfile[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { candidateRepo.getAll().then(data => { setCandidates(data); setLoading(false); }); }, []);

  const filtered = candidates.filter(c => c.fullName.toLowerCase().includes(search.toLowerCase()) || c.skills.some(s => s.toLowerCase().includes(search.toLowerCase())));

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Candidate Pool</h1>
        <p className="text-muted-foreground">Browse and submit candidates to roles</p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search candidates or skills..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? [1,2,3,4,5,6].map(i => <Card key={i} className="animate-pulse"><CardContent className="p-6"><div className="h-6 bg-muted rounded w-1/2" /></CardContent></Card>) : filtered.map(c => (
          <Link key={c.id} to={`/ops/candidates/${c.id}`}>
            <Card className="hover:shadow-md transition-shadow h-full">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold truncate">{c.fullName}</h3>
                    <p className="text-sm text-muted-foreground">{c.currentRole || 'No current role'}</p>
                    <div className="flex gap-2 mt-2 text-xs text-muted-foreground">
                      <span>{c.yearsExperience}y exp</span>
                      <span><Clock className="h-3 w-3 inline" /> {availabilityLabels[c.availability]}</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {c.skills.slice(0,3).map((s,i) => <Badge key={i} variant="secondary" className="text-xs">{s}</Badge>)}
                      {c.skills.length > 3 && <Badge variant="outline" className="text-xs">+{c.skills.length-3}</Badge>}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
