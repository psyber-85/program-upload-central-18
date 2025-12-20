import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Search, Plus, Users, Clock, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatusBadge } from '@/components/placement/ui';
import { trainingRepo } from '@/lib/placement/repositories/trainingRepo';
import { candidateRepo } from '@/lib/placement/repositories/candidateRepo';
import { TrainingProgram, TrainingEnrollment, CandidateProfile } from '@/lib/placement/types';
import { format } from 'date-fns';

export function TrainingManagement() {
  const [programs, setPrograms] = useState<TrainingProgram[]>([]);
  const [enrollments, setEnrollments] = useState<TrainingEnrollment[]>([]);
  const [candidates, setCandidates] = useState<CandidateProfile[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const [programsData, enrollmentsData, candidatesData] = await Promise.all([
        trainingRepo.getPrograms(),
        trainingRepo.getEnrollments(),
        candidateRepo.getAll(),
      ]);
      setPrograms(programsData);
      setEnrollments(enrollmentsData);
      setCandidates(candidatesData);
      setLoading(false);
    };
    loadData();
  }, []);

  const getCandidate = (id: string) => candidates.find((c) => c.id === id);
  const getProgram = (id: string) => programs.find((p) => p.id === id);

  const getProgramEnrollmentCount = (programId: string) =>
    enrollments.filter((e) => e.program_id === programId).length;

  const filteredEnrollments = enrollments.filter((enrollment) => {
    const candidate = getCandidate(enrollment.candidate_id);
    const program = getProgram(enrollment.program_id);

    const matchesSearch =
      candidate?.display_name.toLowerCase().includes(search.toLowerCase()) ||
      program?.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || enrollment.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const enrollmentStats = {
    inProgress: enrollments.filter((e) => e.status === 'IN_PROGRESS').length,
    completed: enrollments.filter((e) => e.status === 'COMPLETED').length,
    total: enrollments.length,
  };

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
          <h1 className="text-2xl font-bold">Training Management</h1>
          <p className="text-muted-foreground">
            {programs.length} programs · {enrollmentStats.inProgress} active enrollments
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Enroll Candidate
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-blue-500/10">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{enrollmentStats.inProgress}</p>
                <p className="text-sm text-muted-foreground">In Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-green-500/10">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{enrollmentStats.completed}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{enrollmentStats.total}</p>
                <p className="text-sm text-muted-foreground">Total Enrollments</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="enrollments">
        <TabsList>
          <TabsTrigger value="enrollments">Enrollments</TabsTrigger>
          <TabsTrigger value="programs">Programs</TabsTrigger>
        </TabsList>

        <TabsContent value="enrollments" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by candidate or program..."
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
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="DROPPED">Dropped</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Enrollments Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Candidate</TableHead>
                    <TableHead>Program</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Expected Completion</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEnrollments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No enrollments found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredEnrollments.map((enrollment) => {
                      const candidate = getCandidate(enrollment.candidate_id);
                      const program = getProgram(enrollment.program_id);

                      return (
                        <TableRow key={enrollment.id}>
                          <TableCell>
                            <Link
                              to={`/ops/candidates/${enrollment.candidate_id}`}
                              className="font-medium hover:underline"
                            >
                              {candidate?.display_name || 'Unknown'}
                            </Link>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{program?.name || 'Unknown'}</p>
                              <p className="text-xs text-muted-foreground">
                                {program?.duration_weeks} weeks · {program?.delivery_mode}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="w-32 space-y-1">
                              <Progress value={enrollment.progress_percent} className="h-2" />
                              <p className="text-xs text-muted-foreground text-center">
                                {enrollment.progress_percent}%
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={enrollment.status} />
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {enrollment.expected_completion_date
                              ? format(new Date(enrollment.expected_completion_date), 'MMM d, yyyy')
                              : '-'}
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="programs" className="space-y-4">
          {/* Programs Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {programs.map((program) => (
              <Card key={program.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <GraduationCap className="h-5 w-5 text-primary" />
                    </div>
                    <Badge variant="secondary">
                      {getProgramEnrollmentCount(program.id)} enrolled
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{program.name}</CardTitle>
                  <CardDescription>{program.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Duration</p>
                      <p className="font-medium">{program.duration_weeks} weeks</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Delivery</p>
                      <p className="font-medium capitalize">{program.delivery_mode.replace('_', ' ')}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Target Levels</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{program.target_levels.from}</Badge>
                      <span className="text-muted-foreground">→</span>
                      <Badge variant="outline">{program.target_levels.to}</Badge>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Modules</p>
                    <div className="flex flex-wrap gap-1">
                      {program.modules.slice(0, 3).map((module) => (
                        <Badge key={module} variant="secondary" className="text-xs">
                          {module}
                        </Badge>
                      ))}
                      {program.modules.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{program.modules.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
