
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProspectTable from '@/components/ProspectTable';
import BulkUploadForm from '@/components/BulkUploadForm';
import AddProspectForm from '@/components/AddProspectForm';

const RegisterTracker = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-screen-xl mx-auto p-4 sm:p-6">
        <h1 className="text-2xl md:text-3xl font-semibold mb-4">Programme Registration Tracker</h1>
        
        <Tabs defaultValue="prospects" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="prospects">Prospect List</TabsTrigger>
            <TabsTrigger value="upload">Bulk Upload</TabsTrigger>
            <TabsTrigger value="add">Add Prospect</TabsTrigger>
          </TabsList>
          
          <TabsContent value="prospects" className="mt-4">
            <ProspectTable />
          </TabsContent>
          
          <TabsContent value="upload" className="mt-4">
            <BulkUploadForm />
          </TabsContent>
          
          <TabsContent value="add" className="mt-4">
            <AddProspectForm />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default RegisterTracker;
