import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ProgramStats {
  programName: string;
  pending: number;
  approved: number;
  rejected: number;
  postponed: number;
  onHold: number;
  total: number;
}

const ProgramSummary = () => {
  const [programStats, setProgramStats] = useState<ProgramStats[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchProgramStats();
    
    // Set up real-time subscription for prospects table changes
    const prospectsChannel = supabase
      .channel('program-stats-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'prospects'
        },
        () => {
          console.log('Prospect data changed, refreshing stats...');
          fetchProgramStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(prospectsChannel);
    };
  }, []);

  const fetchProgramStats = async () => {
    try {
      setLoading(true);
      
      // Fetch prospects with program information via JOIN with registration_programs
      const { data: prospectsWithPrograms, error: prospectsError } = await supabase
        .from('prospects')
        .select(`
          registration_status,
          registration_programs!inner(
            id,
            title
          )
        `)
        .not('program_id', 'is', null);

      if (prospectsError) {
        console.error('Error fetching prospects with programs:', prospectsError);
        throw prospectsError;
      }

      console.log('Prospects with programs:', prospectsWithPrograms);

      // Get all programs from registration_programs to ensure we show all programs
      const { data: allPrograms, error: programsError } = await supabase
        .from('registration_programs')
        .select('id, title')
        .order('title');

      if (programsError) {
        console.error('Error fetching programs:', programsError);
        throw programsError;
      }

      // Create a map to count statistics for each program
      const programStatsMap = new Map();

      // Initialize all programs with zero counts
      allPrograms?.forEach(program => {
        programStatsMap.set(program.title, {
          programName: program.title,
          pending: 0,
          approved: 0,
          rejected: 0,
          postponed: 0,
          onHold: 0,
          total: 0
        });
      });

      // Count prospects for each program
      prospectsWithPrograms?.forEach(prospect => {
        const programTitle = prospect.registration_programs.title;
        const status = prospect.registration_status;

        if (programStatsMap.has(programTitle)) {
          const stats = programStatsMap.get(programTitle);
          stats.total += 1;

          switch (status) {
            case 'Pending':
              stats.pending += 1;
              break;
            case 'Approved':
              stats.approved += 1;
              break;
            case 'Rejected':
              stats.rejected += 1;
              break;
            case 'Postponed':
              stats.postponed += 1;
              break;
            case 'On Hold':
              stats.onHold += 1;
              break;
          }
        }
      });

      const stats = Array.from(programStatsMap.values());
      
      // Log the results for debugging
      stats.forEach(stat => {
        console.log(`Program ${stat.programName}: ${stat.total} prospects (Pending: ${stat.pending}, Approved: ${stat.approved}, Rejected: ${stat.rejected}, Postponed: ${stat.postponed}, On Hold: ${stat.onHold})`);
      });

      setProgramStats(stats);
    } catch (error) {
      console.error('Error fetching program stats:', error);
      toast({
        title: "Error",
        description: "Failed to load program statistics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const chartData = programStats.map(stat => ({
    name: stat.programName.length > 20 ? 
      stat.programName.substring(0, 20) + '...' : 
      stat.programName,
    fullName: stat.programName,
    pending: stat.pending,
    approved: stat.approved,
    rejected: stat.rejected,
    postponed: stat.postponed,
    onHold: stat.onHold
  }));

  const totalStats = programStats.reduce((acc, stat) => ({
    pending: acc.pending + stat.pending,
    approved: acc.approved + stat.approved,
    rejected: acc.rejected + stat.rejected,
    postponed: acc.postponed + stat.postponed,
    onHold: acc.onHold + stat.onHold,
    total: acc.total + stat.total
  }), { pending: 0, approved: 0, rejected: 0, postponed: 0, onHold: 0, total: 0 });

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Program Summary</CardTitle>
          <CardDescription>Loading program statistics...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (programStats.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Program Summary</CardTitle>
          <CardDescription>No programs available</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-gray-500">
            <p>No programs found in the system</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{totalStats.total}</div>
            <p className="text-sm text-muted-foreground">Total Prospects</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">{totalStats.pending}</div>
            <p className="text-sm text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{totalStats.approved}</div>
            <p className="text-sm text-muted-foreground">Approved</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{totalStats.rejected}</div>
            <p className="text-sm text-muted-foreground">Rejected</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{totalStats.postponed}</div>
            <p className="text-sm text-muted-foreground">Postponed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">{totalStats.onHold}</div>
            <p className="text-sm text-muted-foreground">On Hold</p>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Registration Status by Program</CardTitle>
          <CardDescription>Total number of prospects that participate in each program</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  fontSize={12}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(label) => {
                    const item = chartData.find(d => d.name === label);
                    return item?.fullName || label;
                  }}
                />
                <Bar dataKey="pending" stackId="a" fill="#eab308" name="Pending" />
                <Bar dataKey="approved" stackId="a" fill="#22c55e" name="Approved" />
                <Bar dataKey="rejected" stackId="a" fill="#ef4444" name="Rejected" />
                <Bar dataKey="postponed" stackId="a" fill="#3b82f6" name="Postponed" />
                <Bar dataKey="onHold" stackId="a" fill="#f97316" name="On Hold" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Program Details Table */}
      <Card>
        <CardHeader>
          <CardTitle>Program Details</CardTitle>
          <CardDescription>Detailed breakdown by program</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Program</th>
                  <th className="text-center p-2">Total</th>
                  <th className="text-center p-2">Pending</th>
                  <th className="text-center p-2">Approved</th>
                  <th className="text-center p-2">Rejected</th>
                  <th className="text-center p-2">Postponed</th>
                  <th className="text-center p-2">On Hold</th>
                </tr>
              </thead>
              <tbody>
                {programStats.map((stat, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-2 font-medium">{stat.programName}</td>
                    <td className="p-2 text-center">
                      <Badge variant="outline">{stat.total}</Badge>
                    </td>
                    <td className="p-2 text-center">
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                        {stat.pending}
                      </Badge>
                    </td>
                    <td className="p-2 text-center">
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        {stat.approved}
                      </Badge>
                    </td>
                    <td className="p-2 text-center">
                      <Badge variant="secondary" className="bg-red-100 text-red-800">
                        {stat.rejected}
                      </Badge>
                    </td>
                    <td className="p-2 text-center">
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        {stat.postponed}
                      </Badge>
                    </td>
                    <td className="p-2 text-center">
                      <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                        {stat.onHold}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProgramSummary;
