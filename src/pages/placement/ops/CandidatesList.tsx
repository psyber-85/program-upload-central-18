import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Search, Filter, MapPin, Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { StatusBadge, AISkillBadge } from '@/components/placement/ui';
import { candidateRepo } from '@/lib/placement/repositories/candidateRepo';
import { CandidateProfile } from '@/lib/placement/types';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'NEW_INTAKE', label: 'New Intake' },
  { value: 'TRAINING_IN_PROGRESS', label: 'Training' },
  { value: 'PLACEMENT_READY', label: 'Placement Ready' },
  { value: 'PROPOSED_TO_EMPLOYER', label: 'Proposed' },
  { value: 'INTERVIEWING', label: 'Interviewing' },
  { value: 'LOI_SIGNED', label: 'LOI Signed' },
  { value: 'PLACED', label: 'Placed' },
];

const AI_LEVELS = ['L1', 'L2', 'L3', 'L4', 'L5'];

export function CandidatesList() {
  const [candidates, setCandidates] = useState<CandidateProfile[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const data = await candidateRepo.getAll();
      setCandidates(data);
      setLoading(false);
    };
    loadData();
  }, []);

  const filteredCandidates = candidates.filter((candidate) => {
    const matchesSearch =
      candidate.display_name.toLowerCase().includes(search.toLowerCase()) ||
      candidate.headline.toLowerCase().includes(search.toLowerCase()) ||
      candidate.location.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || candidate.status === statusFilter;
    const matchesLevel = levelFilter === 'all' || candidate.ai_skill_level === levelFilter;
    const matchesAvailability = availabilityFilter === 'all' || candidate.availability === availabilityFilter;
    return matchesSearch && matchesStatus && matchesLevel && matchesAvailability;
  });

  // Status summary
  const statusCounts = candidates.reduce((acc, c) => {
    acc[c.status] = (acc[c.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">All Candidates</h1>
          <p className="text-muted-foreground">
            {candidates.length} total · {candidates.filter((c) => c.placement_readiness).length} placement ready
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Candidate
        </Button>
      </div>

      {/* Status Summary */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(statusCounts).map(([status, count]) => (
          <Badge
            key={status}
            variant={statusFilter === status ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => setStatusFilter(statusFilter === status ? 'all' : status)}
          >
            {status.replace(/_/g, ' ')}: {count}
          </Badge>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, headline, or location..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue placeholder="AI Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                {AI_LEVELS.map((level) => (
                  <SelectItem key={level} value={level}>
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="Availability" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Availability</SelectItem>
                <SelectItem value="immediate">Immediate</SelectItem>
                <SelectItem value="two_weeks">2 Weeks</SelectItem>
                <SelectItem value="one_month">1 Month</SelectItem>
                <SelectItem value="flexible">Flexible</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Candidates Grid */}
      {filteredCandidates.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No candidates found matching your criteria</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCandidates.map((candidate) => (
            <Link
              key={candidate.id}
              to={`/ops/candidates/${candidate.id}`}
              className="block"
            >
              <Card className="h-full hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-lg font-semibold text-primary">
                        {candidate.display_name.charAt(0)}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium truncate">{candidate.display_name}</p>
                      <p className="text-sm text-muted-foreground truncate">{candidate.headline}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    <AISkillBadge level={candidate.ai_skill_level} size="sm" />
                    <StatusBadge status={candidate.status} />
                  </div>

                  <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                    <MapPin className="h-3 w-3" />
                    {candidate.location}
                    {candidate.availability && (
                      <>
                        <span className="mx-1">·</span>
                        <span className="capitalize">{candidate.availability.replace('_', ' ')}</span>
                      </>
                    )}
                  </div>

                  {candidate.key_capabilities && (
                    <div className="flex flex-wrap gap-1">
                      {candidate.key_capabilities.slice(0, 3).map((cap) => (
                        <Badge key={cap} variant="secondary" className="text-xs">
                          {cap}
                        </Badge>
                      ))}
                      {candidate.key_capabilities.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{candidate.key_capabilities.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}

                  {candidate.placement_readiness && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <Badge variant="default" className="bg-green-600">
                        Placement Ready
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
