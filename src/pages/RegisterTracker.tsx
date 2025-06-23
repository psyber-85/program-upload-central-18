
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProspectTable from '@/components/ProspectTable';
import BulkUploadForm from '@/components/BulkUploadForm';
import AddProspectForm from '@/components/AddProspectForm';
import ProgramSummary from '@/components/ProgramSummary';
import AddProgramForm from '@/components/AddProgramForm';

const RegisterTracker = () => {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleProgramAdded = () => {
    // Refresh components that depend on program data
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-screen-xl mx-auto p-4 sm:p-6">
        <h1 className="text-2xl md:text-3xl font-semibold mb-6">Programme Registration Tracker</h1>
        
        {/* Summary Dashboard */}
        <div className="mb-6">
          <ProgramSummary key={refreshKey} />
        </div>
        
        <Tabs defaultValue="prospects" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="prospects">Prospect List</TabsTrigger>
            <TabsTrigger value="upload">Bulk Upload</TabsTrigger>
            <TabsTrigger value="add">Add Prospect</TabsTrigger>
            <TabsTrigger value="programs">Manage Programs</TabsTrigger>
          </TabsList>
          
          <TabsContent value="prospects" className="mt-4">
            <ProspectTable key={refreshKey} />
          </TabsContent>
          
          <TabsContent value="upload" className="mt-4">
            <BulkUploadForm key={refreshKey} />
          </TabsContent>
          
          <TabsContent value="add" className="mt-4">
            <AddProspectForm key={refreshKey} />
          </TabsContent>
          
          <TabsContent value="programs" className="mt-4">
            <AddProgramForm onProgramAdded={handleProgramAdded} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default RegisterTracker;
