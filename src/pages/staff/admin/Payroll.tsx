import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign } from 'lucide-react';

const Payroll = () => {
  return (
    <div className="min-h-screen bg-muted/30 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Payroll</h1>
          <p className="text-muted-foreground">Manage monthly payroll runs</p>
        </header>
        <Card className="text-center py-12">
          <CardContent>
            <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Payroll management coming soon</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Payroll;
