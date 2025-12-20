import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const PublicHome = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
          HRDC
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          Human Resource Development Corporation
        </p>
        <p className="text-muted-foreground mb-8">
          Public portal coming soon. Stay tuned for updates.
        </p>
        <Link to="/staff">
          <Button variant="outline" className="gap-2">
            Staff Portal <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default PublicHome;
