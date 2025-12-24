import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Megaphone, 
  FileText, 
  ClipboardList, 
  DollarSign,
  Users,
  Settings,
  ArrowRight
} from 'lucide-react';

const StaffHome = () => {
  return (
    <div className="min-h-screen bg-muted/30 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            AIHQ Staff Portal
          </h1>
          <p className="text-muted-foreground mt-2">
            Welcome to the staff portal. Select a section to get started.
          </p>
        </header>

        {/* Quick Stats - Placeholder */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Revenue (Dec)</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">RM 15,000</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Expenses (Dec)</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">RM 22,705</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Pending Requests</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">3</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Unpaid Invoices</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">2</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Marketing Portal */}
          <Link to="/staff/marketing">
            <Card className="h-full transition-all hover:shadow-lg hover:border-primary/50 cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                    <Megaphone className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl">Marketing Portal</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Manage campaigns, participants, birthdays, and CRM activities.
                </CardDescription>
              </CardContent>
            </Card>
          </Link>

          {/* Requests - Coming Soon */}
          <Card className="h-full opacity-60">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                  <ClipboardList className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl">Requests</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Leave, claims, and training applications. 
                <span className="block mt-2 text-xs font-medium text-amber-600">Coming Soon</span>
              </CardDescription>
            </CardContent>
          </Card>

          {/* Documents - Coming Soon */}
          <Card className="h-full opacity-60">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-100 text-green-600">
                  <FileText className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl">Documents</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                SOPs, policies, and company documents.
                <span className="block mt-2 text-xs font-medium text-amber-600">Coming Soon</span>
              </CardDescription>
            </CardContent>
          </Card>

          {/* Payroll - Coming Soon */}
          <Card className="h-full opacity-60">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-100 text-amber-600">
                  <DollarSign className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl">Payroll</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Payroll runs and payslip management.
                <span className="block mt-2 text-xs font-medium text-amber-600">Admin Only • Coming Soon</span>
              </CardDescription>
            </CardContent>
          </Card>

          {/* Entries - Coming Soon */}
          <Card className="h-full opacity-60">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-teal-100 text-teal-600">
                  <Users className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl">Entries</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Invoices and bills management.
                <span className="block mt-2 text-xs font-medium text-amber-600">Admin Only • Coming Soon</span>
              </CardDescription>
            </CardContent>
          </Card>

          {/* Settings - Coming Soon */}
          <Card className="h-full opacity-60">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-100 text-slate-600">
                  <Settings className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl">Settings</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Staff management and portal settings.
                <span className="block mt-2 text-xs font-medium text-amber-600">Admin Only • Coming Soon</span>
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* IT Support */}
        <div className="mt-8">
          <Card className="border-dashed">
            <CardContent className="flex items-center justify-between py-4">
              <div className="flex items-center gap-3">
                <span className="text-muted-foreground">Need IT support?</span>
              </div>
              <Button variant="outline" size="sm" asChild>
                <a href="mailto:wani@theaihq.net?subject=IT%20Support%20Request">
                  Email IT Support
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StaffHome;
