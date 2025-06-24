
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProspectTable from '@/components/ProspectTable';
import BulkUploadForm from '@/components/BulkUploadForm';
import AddProspectForm from '@/components/AddProspectForm';
import ProgramSummary from '@/components/ProgramSummary';

const RegisterTracker = () => {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-screen-xl mx-auto p-4 sm:p-6">
        <h1 className="text-2xl md:text-3xl font-semibold mb-6">Programme Registration Tracker</h1>
        
        {/* Summary Dashboard */}
        <div className="mb-6">
          <ProgramSummary key={refreshKey} />
        </div>
        
        <Tabs defaultValue="prospects" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="prospects">Prospect List</TabsTrigger>
            <TabsTrigger value="upload">Bulk Upload</TabsTrigger>
            <TabsTrigger value="add">Add Prospect</TabsTrigger>
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
        </Tabs>
      </div>
    </div>
  );
};

export default RegisterTracker;
