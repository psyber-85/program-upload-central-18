
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
  }, []);

  const fetchProgramStats = async () => {
    try {
      setLoading(true);
      
      // Fetch programs and prospects
      const { data: programs, error: programsError } = await supabase
        .from('programs')
        .select('id, title')
        .order('created_at', { ascending: false });

      if (programsError) throw programsError;

      const { data: prospects, error: prospectsError } = await supabase
        .from('prospects')
        .select('program_id, registration_status');

      if (prospectsError) throw prospectsError;

      // Calculate statistics
      const stats = programs?.map(program => {
        const programProspects = prospects?.filter(p => p.program_id === program.id) || [];
        
        const pending = programProspects.filter(p => p.registration_status === 'Pending').length;
        const approved = programProspects.filter(p => p.registration_status === 'Approved').length;
        const rejected = programProspects.filter(p => p.registration_status === 'Rejected').length;
        const postponed = programProspects.filter(p => p.registration_status === 'Postponed').length;
        const onHold = programProspects.filter(p => p.registration_status === 'On Hold').length;
        const total = programProspects.length;

        return {
          programName: program.title,
          pending,
          approved,
          rejected,
          postponed,
          onHold,
          total
        };
      }).filter(stat => stat.total > 0) || []; // Only show programs with prospects

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
          <CardDescription>No prospect data available</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-gray-500">
            <p>Add some prospects to see program statistics</p>
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
          <CardDescription>Visual breakdown of prospect statuses across all programs</CardDescription>
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
