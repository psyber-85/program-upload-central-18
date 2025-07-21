
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Upload, FileSpreadsheet } from 'lucide-react';
import { useCRM } from '@/lib/crm/CRMContext';

const CRMLeadSheetUploader = () => {
  const { currentCampaign } = useCRM();
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    if (!currentCampaign) return;

    const allowedTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    if (!allowedTypes.includes(file.type)) {
      alert('Please upload a CSV or Excel file');
      return;
    }

    setUploading(true);
    
    try {
      // This is a placeholder implementation
      // In a real app, you would parse the file here using papaparse or xlsx
      console.log('Processing file:', file.name);
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      alert(`File "${file.name}" processed successfully! (This is a demo - no actual leads were imported)`);
    } catch (error) {
      console.error('Error processing file:', error);
      alert('Error processing file. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  if (!currentCampaign) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          Bulk Lead Import
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div 
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <div className="space-y-2">
            <p className="text-lg font-medium">Upload Lead Sheet</p>
            <p className="text-sm text-muted-foreground">
              Drag and drop your CSV or Excel file here, or click to select
            </p>
            <p className="text-xs text-muted-foreground">
              Expected columns: Name, Number, Job Role, Organization, Industry, State, etc.
            </p>
          </div>
          
          <div className="mt-4">
            <Input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleChange}
              className="hidden"
              id="file-upload"
              disabled={uploading}
            />
            <Button
              asChild
              variant="outline"
              disabled={uploading}
            >
              <label htmlFor="file-upload" className="cursor-pointer">
                {uploading ? 'Processing...' : 'Select File'}
              </label>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CRMLeadSheetUploader;
