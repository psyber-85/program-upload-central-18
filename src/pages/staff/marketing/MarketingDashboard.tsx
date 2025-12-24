import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Cake, ClipboardList, Target } from 'lucide-react';

const tools = [
  {
    title: 'Participant Manager',
    description: 'Upload participant data for training programs and send automated emails',
    icon: Users,
    href: '/staff/marketing/participant-manager',
    color: 'text-blue-600',
  },
  {
    title: 'Birthday Dashboard',
    description: 'View and manage participant birthdays and send birthday wishes',
    icon: Cake,
    href: '/staff/marketing/birthday-dashboard',
    color: 'text-pink-600',
  },
  {
    title: 'Registration Tracker',
    description: 'Track program registrations and manage prospects',
    icon: ClipboardList,
    href: '/staff/marketing/register-tracker',
    color: 'text-green-600',
  },
  {
    title: 'CRM Campaign Tracker',
    description: 'Manage campaigns, leads, and track sales activities',
    icon: Target,
    href: '/staff/marketing/crm-tracker',
    color: 'text-purple-600',
  },
];

const MarketingDashboard = () => {
  return (
    <div className="min-h-screen bg-muted/30 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Marketing Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage marketing activities, campaigns, and participant data.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tools.map((tool) => (
            <Link key={tool.href} to={tool.href}>
              <Card className="h-full transition-all hover:shadow-lg hover:border-primary/50 cursor-pointer">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-muted ${tool.color}`}>
                      <tool.icon className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-xl">{tool.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {tool.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MarketingDashboard;
