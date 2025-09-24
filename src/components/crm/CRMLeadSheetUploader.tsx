
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
  const [columnValidation, setColumnValidation] = useState<{valid: boolean, missing: string[], invalid: string[]} | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      previewFile(selectedFile);
    }
  };

  const validateColumns = (data: any[]) => {
    const requiredColumns = ['Name', 'Email'];
    const optionalColumns = ['Phone', 'Org', 'Role', 'Industry', 'Lead Source', 'State'];
    const allValidColumns = [...requiredColumns, ...optionalColumns];
    
    if (!data || data.length === 0) {
      return { valid: false, missing: requiredColumns, invalid: [] };
    }
    
    const fileColumns = Object.keys(data[0] || {});
    const missing = requiredColumns.filter(col => !fileColumns.includes(col));
    const invalid = fileColumns.filter(col => !allValidColumns.includes(col));
    
    return {
      valid: missing.length === 0,
      missing,
      invalid
    };
  };

  const downloadTemplate = () => {
    const headers = ['Name', 'Email', 'Phone', 'Org', 'Role', 'Industry', 'Lead Source', 'State'];
    const sampleData = [
      ['John Doe', 'john@example.com', '+60123456789', 'ABC Corp', 'Manager', 'Technology', 'Website', 'Kuala Lumpur'],
      ['Jane Smith', 'jane@company.com', '+60987654321', 'XYZ Ltd', 'Director', 'Finance', 'Referral', 'Selangor']
    ];
    
    const csvContent = [headers, ...sampleData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'crm_leads_template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const previewFile = (file: File) => {
    if (file.name.endsWith('.csv')) {
      Papa.parse(file, {
        header: true,
        preview: 5,
        complete: (results) => {
          console.log('CSV Preview:', results.data);
          const validation = validateColumns(results.data);
          setColumnValidation(validation);
          setPreview(results.data);
          setShowPreview(true);
          
          if (!validation.valid) {
            toast.error(`Missing required columns: ${validation.missing.join(', ')}`);
          }
          if (validation.invalid.length > 0) {
            toast.warning(`Unrecognized columns will be ignored: ${validation.invalid.join(', ')}`);
          }
        },
        error: (error) => {
          console.error('CSV Parse Error:', error);
          toast.error('Error reading CSV file');
        }
      });
    } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      // For XLSX files, show a placeholder preview since full parsing happens during import
      const sampleData = [
        { Name: 'Sample Lead 1', Email: 'lead1@example.com', Phone: '+60123456789' },
        { Name: 'Sample Lead 2', Email: 'lead2@example.com', Phone: '+60987654321' }
      ];
      const validation = validateColumns(sampleData);
      setColumnValidation(validation);
      setPreview(sampleData);
      setShowPreview(true);
      toast.info('Excel file selected - upload to validate columns');
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
        setColumnValidation(null);
        
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
        <div className="space-y-4">
          <div className="p-4 border rounded-lg bg-amber-50 dark:bg-amber-950/20">
            <h4 className="font-medium text-amber-800 dark:text-amber-200 mb-3">Required Column Names (Case Sensitive)</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="space-y-1">
                <div className="font-medium text-red-600 dark:text-red-400">Required:</div>
                <div className="font-mono text-xs bg-white dark:bg-gray-900 p-2 rounded">Name</div>
                <div className="font-mono text-xs bg-white dark:bg-gray-900 p-2 rounded">Email</div>
              </div>
              <div className="space-y-1">
                <div className="font-medium text-gray-600 dark:text-gray-400">Optional:</div>
                <div className="font-mono text-xs bg-white dark:bg-gray-900 p-2 rounded">Phone</div>
                <div className="font-mono text-xs bg-white dark:bg-gray-900 p-2 rounded">Org</div>
                <div className="font-mono text-xs bg-white dark:bg-gray-900 p-2 rounded">Role</div>
                <div className="font-mono text-xs bg-white dark:bg-gray-900 p-2 rounded">Industry</div>
                <div className="font-mono text-xs bg-white dark:bg-gray-900 p-2 rounded">Lead Source</div>
                <div className="font-mono text-xs bg-white dark:bg-gray-900 p-2 rounded">State</div>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={downloadTemplate}
                className="text-xs"
              >
                Download Template CSV
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="lead-file">Upload CSV or XLSX file with exact column names above</Label>
            <Input
              id="lead-file"
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
              className="cursor-pointer"
            />
          </div>
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
                <Label>Data Preview (first 3 rows)</Label>
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
                
                {columnValidation && (
                  <div className="space-y-2">
                    {columnValidation.valid ? (
                      <div className="flex items-start space-x-2 text-sm text-green-600 dark:text-green-400">
                        <CheckCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium">Column validation passed!</p>
                          <p className="text-xs">File contains all required columns with correct names.</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start space-x-2 text-sm text-red-600 dark:text-red-400">
                        <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium">Column validation failed!</p>
                          {columnValidation.missing.length > 0 && (
                            <p className="text-xs">Missing required columns: {columnValidation.missing.join(', ')}</p>
                          )}
                          {columnValidation.invalid.length > 0 && (
                            <p className="text-xs">Unrecognized columns: {columnValidation.invalid.join(', ')}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            <Button 
              onClick={handleUpload} 
              disabled={loading || (columnValidation && !columnValidation.valid)}
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
            <AlertTriangle className="h-3 w-3 mt-0.5 text-orange-500" />
            <div>
              <p className="font-medium">Important Notes:</p>
              <ul className="list-disc list-inside space-y-1 mt-1">
                <li>Column names must match EXACTLY as shown above (case-sensitive)</li>
                <li>Use the template to avoid column name issues</li>
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
