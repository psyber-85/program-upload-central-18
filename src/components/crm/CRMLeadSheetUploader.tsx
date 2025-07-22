
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, FileText, AlertTriangle } from 'lucide-react';
import { useCrm } from '@/lib/crm/CRMContext';
import { importCrmLeadsFromSheet } from '@/lib/crm/placeholderFunctions';
import { toast } from 'sonner';
import Papa from 'papaparse';

const CRMLeadSheetUploader = () => {
  const { state } = useCrm();
  const { activeCampaignId } = state;
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<any[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      previewFile(selectedFile);
    }
  };

  const previewFile = (file: File) => {
    if (file.name.endsWith('.csv')) {
      Papa.parse(file, {
        header: true,
        preview: 5,
        complete: (results) => {
          console.log('CSV Preview:', results.data);
          setPreview(results.data);
          setShowPreview(true);
        },
        error: (error) => {
          console.error('CSV Parse Error:', error);
          toast.error('Error reading CSV file');
        }
      });
    } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      // For XLSX files, we would use a library like 'xlsx'
      // For now, show a placeholder preview
      setPreview([
        { Name: 'John Doe', Email: 'john@example.com', Phone: '+60123456789' },
        { Name: 'Jane Smith', Email: 'jane@example.com', Phone: '+60987654321' }
      ]);
      setShowPreview(true);
      toast.info('XLSX preview is a placeholder - actual parsing would be implemented');
    }
  };

  const handleUpload = async () => {
    if (!file || !activeCampaignId) {
      toast.error('Please select a file and ensure a campaign is active');
      return;
    }

    setLoading(true);
    try {
      const result = await importCrmLeadsFromSheet(file, activeCampaignId);
      
      toast.success(
        `Import completed! ${result.imported} leads imported, ${result.duplicates} duplicates found`
      );
      
      if (result.errors.length > 0) {
        toast.error(`Errors: ${result.errors.join(', ')}`);
      }
      
      // Reset form
      setFile(null);
      setPreview([]);
      setShowPreview(false);
      
      // Clear file input
      const fileInput = document.getElementById('lead-file') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
    } catch (error) {
      toast.error('Failed to import leads');
    } finally {
      setLoading(false);
    }
  };

  if (!activeCampaignId) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-sm text-muted-foreground">
            Select a campaign to upload leads
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Upload className="h-5 w-5" />
          <span>Import Leads</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="lead-file">Upload CSV or XLSX file</Label>
          <Input
            id="lead-file"
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileChange}
            className="cursor-pointer"
          />
          <p className="text-xs text-muted-foreground">
            Supports CSV and Excel files
          </p>
        </div>

        {file && (
          <div className="space-y-3">
            <div className="flex items-center space-x-2 p-2 bg-muted rounded">
              <FileText className="h-4 w-4" />
              <span className="text-sm font-medium">{file.name}</span>
            </div>

            {showPreview && preview.length > 0 && (
              <div className="space-y-2">
                <Label>Data Preview (first 5 rows)</Label>
                <div className="border rounded p-3 bg-muted/50 max-h-40 overflow-auto">
                  <div className="text-xs font-mono">
                    {preview.map((row, index) => (
                      <div key={index} className="mb-1">
                        {JSON.stringify(row, null, 2)}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-start space-x-2 text-sm text-amber-600">
                  <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Expected columns:</p>
                    <p className="text-xs">
                      Name → crm_name, Email → crm_email, Phone → crm_number, 
                      Organization → crm_org, etc.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <Button 
              onClick={handleUpload} 
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Importing...' : 'Import Leads'}
            </Button>
          </div>
        )}

        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>Tips:</strong></p>
          <ul className="list-disc list-inside space-y-1">
            <li>Include headers in your file (Name, Email, Phone, etc.)</li>
            <li>Duplicates are detected by Name + Phone combination</li>
            <li>Missing fields will be left empty and can be edited later</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default CRMLeadSheetUploader;
