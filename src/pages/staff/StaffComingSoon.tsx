import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const StaffComingSoon = () => {
  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-6">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="text-2xl">Staff Portal</CardTitle>
          <CardDescription>
            This portal is being revamped. The Marketing tools remain available.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full">
            <Link to="/staff/marketing">Go to Marketing Portal</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default StaffComingSoon;
