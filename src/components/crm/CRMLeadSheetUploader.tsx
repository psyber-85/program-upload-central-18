
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface CRMLeadSheetUploaderProps {
  campaignId: string;
}

const CRMLeadSheetUploader: React.FC<CRMLeadSheetUploaderProps> = ({ campaignId }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const validTypes = ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv'];
      if (validTypes.includes(selectedFile.type) || selectedFile.name.endsWith('.csv') || selectedFile.name.endsWith('.xlsx')) {
        setFile(selectedFile);
      } else {
        toast.error('Please upload a valid CSV or Excel file');
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file first');
      return;
    }

    setIsUploading(true);
    try {
      // Simulate file processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // This would normally parse the file and import leads
      toast.success('File uploaded successfully! Lead import functionality coming soon.');
      setFile(null);
    } catch (error) {
      toast.error('Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          Bulk Lead Import
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-900">File Format Requirements:</p>
                <ul className="mt-1 text-blue-800 space-y-1">
                  <li>• CSV or Excel (.xlsx) format</li>
                  <li>• Headers: Name, Number, Job Role, Organization, Industry, State, Lead Source, Potential Deal Size, Confirmed Deal Size, Lead Score, Status, Notes</li>
                  <li>• Duplicate check by Name + Number combination</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="lead-file">Select File</Label>
              <Input
                id="lead-file"
                type="file"
                accept=".csv,.xlsx"
                onChange={handleFileChange}
                disabled={isUploading}
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleUpload}
                disabled={!file || isUploading}
                className="w-full"
              >
                <Upload className="h-4 w-4 mr-2" />
                {isUploading ? 'Uploading...' : 'Upload & Import'}
              </Button>
            </div>
          </div>

          {file && (
            <div className="bg-green-50 p-3 rounded-lg">
              <p className="text-sm text-green-800">
                Selected: <strong>{file.name}</strong> ({(file.size / 1024).toFixed(1)} KB)
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CRMLeadSheetUploader;
