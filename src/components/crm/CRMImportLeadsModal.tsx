import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Download, Upload, FileSpreadsheet, CheckCircle, XCircle } from 'lucide-react';
import { useCrm } from '@/lib/crm/CRMContext';
import { importCrmLeadsFromSheet } from '@/lib/crm/placeholderFunctions';
import { toast } from 'sonner';
import Papa from 'papaparse';

interface CRMImportLeadsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CRMImportLeadsModal: React.FC<CRMImportLeadsModalProps> = ({ open, onOpenChange }) => {
  const { state, loadLeads } = useCrm();
  const { activeCampaignId } = state;
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string[][]>([]);
  const [columnsValid, setColumnsValid] = useState<boolean | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    if (selectedFile) {
      previewFile(selectedFile);
    } else {
      setPreview([]);
      setColumnsValid(null);
    }
  };

  const validateColumns = (headers: string[]): boolean => {
    const lowerHeaders = headers.map(h => h.toLowerCase().trim());
    const hasName = lowerHeaders.includes('name');
    const hasEmail = lowerHeaders.includes('email');
    return hasName && hasEmail;
  };

  const downloadTemplate = () => {
    const csvContent = 'Name,Email,Phone,Job Role,Organization,Industry,Lead Source,State,Potential Deal Size,Notes\n' +
      'John Doe,john@example.com,012-3456789,Manager,ABC Corp,Technology,Website,Selangor,10000,Sample lead\n';
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'leads_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const previewFile = (selectedFile: File) => {
    if (selectedFile.name.endsWith('.csv')) {
      Papa.parse(selectedFile, {
        complete: (results) => {
          const data = results.data as string[][];
          if (data.length > 0) {
            const isValid = validateColumns(data[0]);
            setColumnsValid(isValid);
            setPreview(data.slice(0, 4));
          }
        },
        error: () => {
          toast.error('Failed to parse CSV file');
        }
      });
    } else if (selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.xls')) {
      setPreview([['Excel file preview not available. Will be processed on import.']]);
      setColumnsValid(true);
    }
  };

  const handleUpload = async () => {
    if (!file || !activeCampaignId) return;

    setLoading(true);
    try {
      await importCrmLeadsFromSheet(file, activeCampaignId);
      toast.success('Leads imported successfully');
      
      // Reload leads for the active campaign
      await loadLeads(activeCampaignId);
      
      // Reset form
      setFile(null);
      setPreview([]);
      setColumnsValid(null);
      onOpenChange(false);
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Failed to import leads');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Import Leads from Spreadsheet
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!activeCampaignId ? (
            <div className="text-center py-4">
              <p className="text-muted-foreground">Please select a campaign first</p>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileChange}
                  className="cursor-pointer"
                />
                <p className="text-xs text-muted-foreground">
                  Accepts CSV or Excel files (.csv, .xlsx, .xls)
                </p>
              </div>

              {preview.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {columnsValid === true ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : columnsValid === false ? (
                      <XCircle className="h-4 w-4 text-destructive" />
                    ) : null}
                    <span className="text-sm font-medium">
                      {columnsValid === true ? 'Valid columns detected' : 
                       columnsValid === false ? 'Missing required columns (Name, Email)' : 
                       'Validating...'}
                    </span>
                  </div>
                  <div className="bg-muted p-2 rounded text-xs overflow-x-auto max-h-24 overflow-y-auto">
                    {preview.map((row, i) => (
                      <div key={i} className="whitespace-nowrap">
                        {row.slice(0, 4).join(' | ')}...
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadTemplate}
                  className="flex-1"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Template
                </Button>
                <Button
                  onClick={handleUpload}
                  disabled={!file || loading || columnsValid === false}
                  className="flex-1"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {loading ? 'Importing...' : 'Import Leads'}
                </Button>
              </div>

              <div className="text-xs text-muted-foreground space-y-1">
                <p className="font-medium">Required columns:</p>
                <ul className="list-disc list-inside">
                  <li>Name</li>
                  <li>Email</li>
                </ul>
                <p className="font-medium mt-2">Optional columns:</p>
                <ul className="list-disc list-inside">
                  <li>Phone, Job Role, Organization, Industry</li>
                  <li>Lead Source, State, Potential Deal Size, Notes</li>
                </ul>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CRMImportLeadsModal;
