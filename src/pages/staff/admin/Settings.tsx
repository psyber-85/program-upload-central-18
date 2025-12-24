import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Settings as SettingsIcon } from 'lucide-react';

const Settings = () => {
  return (
    <div className="min-h-screen bg-muted/30 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">Staff and portal configuration</p>
        </header>
        <Card className="text-center py-12">
          <CardContent>
            <SettingsIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Settings coming soon</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
