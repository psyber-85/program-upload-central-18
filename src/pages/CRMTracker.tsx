
import React, { useEffect, useState } from 'react';
import { CrmProvider } from '@/lib/crm/CRMContext';
import CRMCampaignTabs from '@/components/crm/CRMCampaignTabs';
import CRMCampaignSummary from '@/components/crm/CRMCampaignSummary';
import CRMLeadsTable from '@/components/crm/CRMLeadsTable';
import CRMLeadSheetUploader from '@/components/crm/CRMLeadSheetUploader';
import CRMAuthForm from '@/components/crm/CRMAuthForm';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { LogOut } from 'lucide-react';

const CRMTracker = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [userEmail, setUserEmail] = useState<string>('');

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
      setUserEmail(user?.email || '');
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session?.user);
      setUserEmail(session?.user?.email || '');
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleAuthSuccess = () => {
    // Authentication success is handled by the auth state change listener
    console.log('Authentication successful');
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

        <div className="flex justify-center">
          <CRMAuthForm onSuccess={handleAuthSuccess} />
        </div>
      </div>
    );
  }

  // Authenticated - render CRM interface
  return (
    <CrmProvider>
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">CRM Campaign Tracker</h1>
            <p className="text-muted-foreground">
              Manage your marketing campaigns and track leads through the sales pipeline
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Welcome, {userEmail}
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleSignOut}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
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
