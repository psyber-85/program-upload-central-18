
import React, { useEffect, useState } from 'react';
import { CrmProvider } from '@/lib/crm/CRMContext';
import CRMCampaignTabs from '@/components/crm/CRMCampaignTabs';
import CRMCampaignSummary from '@/components/crm/CRMCampaignSummary';
import CRMLeadsTable from '@/components/crm/CRMLeadsTable';
import CRMLeadSheetUploader from '@/components/crm/CRMLeadSheetUploader';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const CRMTracker = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session?.user);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/crm-tracker`
      }
    });
    
    if (error) {
      console.error('Error signing in:', error);
    }
  };

  // Loading state
  if (isAuthenticated === null) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">CRM Campaign Tracker</h1>
          <p className="text-muted-foreground">
            Manage your marketing campaigns and track leads through the sales pipeline
          </p>
        </div>

        <Card>
          <CardContent className="p-8 text-center">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Authentication Required</h2>
              <p className="text-muted-foreground">
                Please sign in to access your CRM campaigns and leads.
              </p>
              <Button onClick={handleSignIn} size="lg">
                Sign In with Google
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Authenticated - render CRM interface
  return (
    <CrmProvider>
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">CRM Campaign Tracker</h1>
          <p className="text-muted-foreground">
            Manage your marketing campaigns and track leads through the sales pipeline
          </p>
        </div>

        <div className="space-y-6">
          <CRMCampaignTabs />
          
          <CRMCampaignSummary />
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <CRMLeadsTable />
            </div>
            <div className="lg:col-span-1">
              <CRMLeadSheetUploader />
            </div>
          </div>
        </div>
      </div>
    </CrmProvider>
  );
};

export default CRMTracker;
