import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

const PayrollRunDetail = () => {
  const { runId } = useParams();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-muted/30 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" className="mb-4" onClick={() => navigate('/staff/payroll')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Payroll
        </Button>
        <Card className="text-center py-12">
          <CardContent>
            <p className="text-muted-foreground">Payroll run detail coming soon</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PayrollRunDetail;
