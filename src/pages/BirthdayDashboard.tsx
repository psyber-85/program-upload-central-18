import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Calendar, Mail, Users } from 'lucide-react';
import BirthdayBulkUploadCard from '@/components/marketing/BirthdayBulkUploadCard';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface BirthdayStats {
  today_total: number;
  today_sent: number;
  today_pending: number;
  month_total: number;
  yearByMonth: Array<{ month: number; total: number }>;
  today_sample: Array<{ name: string; email: string }>;
}

interface SendRemainingResponse {
  sent: number;
  pendingBefore: number;
  errors: Array<{ id: string; email: string; reason: string }>;
}

const BirthdayDashboard = () => {
  const [stats, setStats] = useState<BirthdayStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [sendingRemaining, setSendingRemaining] = useState(false);
  const [testEmail, setTestEmail] = useState({ to: '', name: '' });
  const [sendingTest, setSendingTest] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('birthday-log');
      
      if (error) throw error;
      
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast({
        title: "Error",
        description: "Failed to fetch birthday statistics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendRemaining = async () => {
    try {
      setSendingRemaining(true);
      const { data, error } = await supabase.functions.invoke('send-remaining', {
        body: {},
      });
      
      if (error) throw error;
      
      const result = data as SendRemainingResponse;
      
      toast({
        title: "Success",
        description: `Sent ${result.sent} birthday emails. ${result.errors.length} errors.`,
      });
      
      // Refresh stats
      await fetchStats();
    } catch (error) {
      console.error('Error sending remaining:', error);
      toast({
        title: "Error",
        description: "Failed to send remaining birthday emails",
        variant: "destructive",
      });
    } finally {
      setSendingRemaining(false);
    }
  };

  const handleTestEmail = async () => {
    if (!testEmail.to || !testEmail.name) {
      toast({
        title: "Error",
        description: "Please enter both email and name",
        variant: "destructive",
      });
      return;
    }

    try {
      setSendingTest(true);
      const { data, error } = await supabase.functions.invoke('test-email', {
        body: testEmail,
      });
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: `Test email sent to ${testEmail.to}`,
      });
      
      setTestEmail({ to: '', name: '' });
    } catch (error) {
      console.error('Error sending test email:', error);
      toast({
        title: "Error",
        description: "Failed to send test email",
        variant: "destructive",
      });
    } finally {
      setSendingTest(false);
    }
  };

  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const chartData = {
    labels: monthNames,
    datasets: [
      {
        label: 'Birthdays',
        data: stats?.yearByMonth.map(item => item.total) || [],
        backgroundColor: 'hsl(var(--primary) / 0.8)',
        borderColor: 'hsl(var(--primary))',
        borderWidth: 1,
      },
    ],
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
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Birthday Dashboard</h1>
        <Button onClick={fetchStats} variant="outline">
          Refresh
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Today Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Birthdays</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.today_total || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.today_sent || 0} sent, {stats?.today_pending || 0} pending
            </p>
            {stats?.today_sample && stats.today_sample.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium mb-2">Today's Birthday People:</p>
                <div className="space-y-1">
                  {stats.today_sample.map((person, i) => (
                    <p key={i} className="text-xs text-muted-foreground truncate">
                      {person.name}
                    </p>
                  ))}
                </div>
              </div>
            )}
            {(stats?.today_pending || 0) > 0 && (
              <Button 
                onClick={handleSendRemaining}
                disabled={sendingRemaining}
                className="w-full mt-4"
                size="sm"
              >
                {sendingRemaining && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send Remaining Now
              </Button>
            )}
          </CardContent>
        </Card>

        {/* This Month Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.month_total || 0}</div>
            <p className="text-xs text-muted-foreground">
              Total birthdays this month
            </p>
          </CardContent>
        </Card>

        {/* Test Email Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Test Email</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <Label htmlFor="test-email">Email</Label>
                <Input
                  id="test-email"
                  type="email"
                  placeholder="test@example.com"
                  value={testEmail.to}
                  onChange={(e) => setTestEmail(prev => ({ ...prev, to: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="test-name">Name</Label>
                <Input
                  id="test-name"
                  placeholder="Test Name"
                  value={testEmail.name}
                  onChange={(e) => setTestEmail(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <Button 
                onClick={handleTestEmail}
                disabled={sendingTest}
                className="w-full"
                size="sm"
              >
                {sendingTest && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send Test
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <BirthdayBulkUploadCard onUploaded={fetchStats} />

      {/* Yearly Overview Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Yearly Overview</CardTitle>
          <CardDescription>Birthday distribution throughout the year</CardDescription>
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