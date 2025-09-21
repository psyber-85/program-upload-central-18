import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Users, TrendingUp, Mail, Play, TestTube } from 'lucide-react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { supabase } from '@/integrations/supabase/client';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface BirthdayStats {
  today: {
    count: number;
    people: { name: string; email: string }[];
  };
  monthSummary: {
    totalThisMonth: number;
    sentThisMonth: number;
  };
  yearByMonth: number[];
}

const BirthdayDashboard = () => {
  const { toast } = useToast();
  const [stats, setStats] = useState<BirthdayStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [testToken, setTestToken] = useState(
    localStorage.getItem('birthday-test-token') || ''
  );
  const [actionLoading, setActionLoading] = useState<'send' | 'dry-run' | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('birthday-log');
      
      if (error) throw error;
      
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
      toast({
        title: "Error",
        description: "Failed to load birthday statistics.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTestAction = async (dryRun: boolean) => {
    if (!testToken.trim()) {
      toast({
        title: "Token Required",
        description: "Please enter a test token to perform this action.",
        variant: "destructive"
      });
      return;
    }

    setActionLoading(dryRun ? 'dry-run' : 'send');
    
    try {
      const { data, error } = await supabase.functions.invoke('birthday-test', {
        body: { dryRun },
        headers: {
          'Authorization': `Bearer ${testToken}`
        }
      });

      if (error) throw error;

      // Store token for future use
      localStorage.setItem('birthday-test-token', testToken);

      toast({
        title: dryRun ? "Dry Run Complete" : "Emails Sent Successfully",
        description: `${data.sent} emails ${dryRun ? 'would be sent' : 'sent'} to birthday recipients.`,
      });

      // Reload stats after action
      await loadStats();
    } catch (error: any) {
      console.error('Error performing action:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to perform action.",
        variant: "destructive"
      });
    } finally {
      setActionLoading(null);
    }
  };

  const chartData = {
    labels: [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ],
    datasets: [
      {
        label: 'Birthdays',
        data: stats?.yearByMonth || Array(12).fill(0),
        backgroundColor: 'hsl(var(--primary))',
        borderColor: 'hsl(var(--primary))',
        borderWidth: 1,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Birthdays by Month',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading birthday statistics...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Birthday Dashboard</h1>
        <p className="text-muted-foreground">
          Automated birthday email system with daily monitoring and manual controls
        </p>
      </div>

      {/* Today's Birthdays Card */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Birthdays</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.today.count || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              People celebrating today
            </p>
            {stats?.today.people && stats.today.people.length > 0 && (
              <div className="mt-3 space-y-1">
                {stats.today.people.slice(0, 3).map((person, index) => (
                  <div key={index} className="text-xs text-muted-foreground">
                    {person.name} ({person.email})
                  </div>
                ))}
                {stats.today.people.length > 3 && (
                  <div className="text-xs text-muted-foreground">
                    +{stats.today.people.length - 3} more
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.monthSummary.totalThisMonth || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total birthdays this month
            </p>
            {stats?.monthSummary.sentThisMonth !== undefined && (
              <div className="text-xs text-green-600 mt-1">
                {stats.monthSummary.sentThisMonth} emails sent
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Automation Status</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Active</div>
            <p className="text-xs text-muted-foreground mt-1">
              Daily cron job at 01:00 UTC
            </p>
            <div className="text-xs text-muted-foreground mt-1">
              (09:00 Malaysia time)
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Manual Controls */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Manual Controls
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="testToken">Test Token</Label>
            <Input
              id="testToken"
              type="password"
              value={testToken}
              onChange={(e) => setTestToken(e.target.value)}
              placeholder="Enter test token for manual actions"
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Required for manual email sending and dry runs
            </p>
          </div>
          
          <div className="flex gap-4">
            <Button
              onClick={() => handleTestAction(true)}
              disabled={!testToken || actionLoading !== null}
              variant="outline"
              className="flex items-center gap-2"
            >
              {actionLoading === 'dry-run' ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                  Running...
                </>
              ) : (
                <>
                  <TestTube className="h-4 w-4" />
                  Dry Run
                </>
              )}
            </Button>
            
            <Button
              onClick={() => handleTestAction(false)}
              disabled={!testToken || actionLoading !== null}
              className="flex items-center gap-2"
            >
              {actionLoading === 'send' ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                  Sending...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Send Now
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Yearly Overview Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Yearly Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <Bar data={chartData} options={chartOptions} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BirthdayDashboard;