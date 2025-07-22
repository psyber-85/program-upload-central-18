
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, FileText, AlertTriangle, CheckCircle } from 'lucide-react';
import { useCrm } from '@/lib/crm/CRMContext';
import { importCrmLeadsFromSheet } from '@/lib/crm/placeholderFunctions';
import { toast } from 'sonner';
import Papa from 'papaparse';

const CRMLeadSheetUploader = () => {
  const { state, loadLeads } = useCrm();
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
      // For XLSX files, show a placeholder preview since full parsing happens during import
      setPreview([
        { Name: 'Sample Lead 1', Email: 'lead1@example.com', Phone: '+60123456789' },
        { Name: 'Sample Lead 2', Email: 'lead2@example.com', Phone: '+60987654321' }
      ]);
      setShowPreview(true);
      toast.info('Excel file selected - preview will show sample data');
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
      
      if (result.errors.length > 0) {
        toast.error(`Import failed: ${result.errors.join(', ')}`);
        return;
      }

      if (result.imported > 0 || result.duplicates > 0) {
        toast.success(
          `Import completed! ${result.imported} leads imported${result.duplicates > 0 ? `, ${result.duplicates} duplicates skipped` : ''}`
        );
        
        // Refresh the leads list
        await loadLeads(activeCampaignId);
        
        // Reset form
        setFile(null);
        setPreview([]);
        setShowPreview(false);
        
        // Clear file input
        const fileInput = document.getElementById('lead-file') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } else {
        toast.warning('No new leads were imported');
      }
      
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Failed to import leads. Please check your file format and try again.');
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
              <span className="text-xs text-muted-foreground">
                ({(file.size / 1024).toFixed(1)} KB)
              </span>
            </div>

            {showPreview && preview.length > 0 && (
              <div className="space-y-2">
                <Label>Data Preview (first 5 rows)</Label>
                <div className="border rounded p-3 bg-muted/50 max-h-40 overflow-auto">
                  <div className="text-xs font-mono space-y-1">
                    {preview.slice(0, 3).map((row, index) => (
                      <div key={index} className="p-1 bg-background rounded">
                        {Object.entries(row).slice(0, 4).map(([key, value]) => (
                          <div key={key} className="text-xs">
                            <span className="font-medium">{key}:</span> {String(value).substring(0, 30)}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-start space-x-2 text-sm text-amber-600">
                  <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Required columns:</p>
                    <p className="text-xs">
                      Name, Email (required) • Phone, Org, Role, Industry, State (optional)
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
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Importing...
                </>
              ) : (
                'Import Leads'
              )}
            </Button>
          </div>
        )}

        <div className="text-xs text-muted-foreground space-y-1">
          <div className="flex items-start space-x-2">
            <CheckCircle className="h-3 w-3 mt-0.5 text-green-500" />
            <div>
              <p className="font-medium">Tips for best results:</p>
              <ul className="list-disc list-inside space-y-1 mt-1">
                <li>Include headers: Name, Email, Phone, Organization, Role, etc.</li>
                <li>Name and Email are required fields</li>
                <li>Duplicates are detected using Name + Email combination</li>
                <li>Invalid email formats will be rejected</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CRMLeadSheetUploader;
