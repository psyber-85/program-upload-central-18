
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, UserCheck, Clock, XCircle, Pause, AlertCircle } from 'lucide-react';
import { supabaseProspectService } from '@/services/supabaseProspectService';

interface ProgramSummaryData {
  program_title: string;
  total_prospects: number;
  approved: number;
  pending: number;
  rejected: number;
  postponed: number;
  on_hold: number;
}

const ProgramSummary = () => {
  const [summaryData, setSummaryData] = useState<ProgramSummaryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSummaryData();
  }, []);

  const fetchSummaryData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabaseProspectService.getProgramSummary();
      
      if (error) throw error;
      
      setSummaryData(data || []);
    } catch (err: any) {
      console.error('Error fetching program summary:', err);
      setError('Failed to load program summary');
    } finally {
      setLoading(false);
    }
  };

  const getTotalProspects = () => {
    return summaryData.reduce((total, program) => total + program.total_prospects, 0);
  };

  const getTotalApproved = () => {
    return summaryData.reduce((total, program) => total + program.approved, 0);
  };

  const getTotalPending = () => {
    return summaryData.reduce((total, program) => total + program.pending, 0);
  };

  const getTotalRejected = () => {
    return summaryData.reduce((total, program) => total + program.rejected, 0);
  };

  const getTotalPostponed = () => {
    return summaryData.reduce((total, program) => total + program.postponed, 0);
  };

  const getTotalOnHold = () => {
    return summaryData.reduce((total, program) => total + program.on_hold, 0);
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Prospects</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getTotalProspects()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{getTotalApproved()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{getTotalPending()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{getTotalRejected()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Postponed</CardTitle>
            <Pause className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{getTotalPostponed()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On Hold</CardTitle>
            <AlertCircle className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{getTotalOnHold()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Program-specific breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Programme Breakdown</CardTitle>
          <CardDescription>Registration status by programme</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {summaryData.map((program) => (
              <div key={program.program_title} className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm">{program.program_title}</h4>
                  <Badge variant="outline">{program.total_prospects} total</Badge>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {program.approved > 0 && (
                    <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                      {program.approved} Approved
                    </Badge>
                  )}
                  {program.pending > 0 && (
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                      {program.pending} Pending
                    </Badge>
                  )}
                  {program.rejected > 0 && (
                    <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-200">
                      {program.rejected} Rejected
                    </Badge>
                  )}
                  {program.postponed > 0 && (
                    <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                      {program.postponed} Postponed
                    </Badge>
                  )}
                  {program.on_hold > 0 && (
                    <Badge variant="secondary" className="bg-gray-100 text-gray-800 border-gray-200">
                      {program.on_hold} On Hold
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProgramSummary;
