
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { useCRM } from '../../lib/crm/CRMContext';
import { importCrmLeadsFromSheet } from '../../lib/crm/placeholderFunctions';
import { toast } from 'sonner';

export const CRMLeadSheetUploader = () => {
  const { activeCampaignId } = useCRM();
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      
      // Mock preview data - in real implementation, this would parse the file
      const mockPreview = [
        {
          Name: 'John Doe',
          Number: '+60123456789',
          'Job Role': 'Manager',
          Organization: 'ABC Corp',
          Industry: 'Technology',
          State: 'Selangor',
          'Lead Source': 'LinkedIn',
          'Potential Deal Size': '25000',
          'Confirmed Deal Size': '0',
          'Lead Score': 'A',
          Status: 'Future',
          Notes: 'Interested in training'
        },
        {
          Name: 'Jane Smith',
          Number: '+60187654321',
          'Job Role': 'Director',
          Organization: 'XYZ Ltd',
          Industry: 'Manufacturing',
          State: 'Johor',
          'Lead Source': 'Email',
          'Potential Deal Size': '45000',
          'Confirmed Deal Size': '45000',
          'Lead Score': 'A',
          Status: 'Success',
          Notes: 'Deal closed'
        }
      ];
      
      setPreviewData(mockPreview);
    }
  };

  const handleImport = async () => {
    if (!file || !activeCampaignId) {
      toast.error('Please select a file and campaign');
      return;
    }

    setLoading(true);
    try {
      const result = await importCrmLeadsFromSheet(file, activeCampaignId);
      
      toast.success(
        `Import completed! ${result.imported} leads imported, ${result.duplicates} duplicates skipped.`
      );
      
      setOpen(false);
      setFile(null);
      setPreviewData([]);
    } catch (error) {
      toast.error('Failed to import leads');
      console.error('Error importing leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const expectedHeaders = [
    'Name', 'Number', 'Job Role', 'Organization', 'Industry', 'State', 
    'Lead Source', 'Potential Deal Size', 'Confirmed Deal Size', 
    'Lead Score', 'Status', 'Notes'
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Upload className="h-4 w-4 mr-2" />
          Import Leads
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Leads from Spreadsheet</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
            <div className="text-center">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <Label htmlFor="file-upload" className="cursor-pointer">
                <span className="text-sm text-gray-600">
                  Upload CSV or Excel file
                </span>
                <Input
                  id="file-upload"
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </Label>
              {file && (
                <p className="text-sm text-gray-600 mt-2">
                  Selected: {file.name}
                </p>
              )}
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Expected Headers:</h4>
            <div className="grid grid-cols-3 gap-2 text-sm text-blue-800">
              {expectedHeaders.map((header) => (
                <div key={header} className="bg-blue-100 px-2 py-1 rounded">
                  {header}
                </div>
              ))}
            </div>
          </div>

          {previewData.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Preview (First 2 rows):</h4>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {Object.keys(previewData[0]).map((header) => (
                        <TableHead key={header} className="text-xs">
                          {header}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewData.slice(0, 2).map((row, index) => (
                      <TableRow key={index}>
                        {Object.values(row).map((value, cellIndex) => (
                          <TableCell key={cellIndex} className="text-xs">
                            {String(value)}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-900">Import Notes:</h4>
                <ul className="text-sm text-yellow-800 mt-1 space-y-1">
                  <li>• Duplicates are detected by matching Name + Number</li>
                  <li>• All imported leads will be added to the current campaign</li>
                  <li>• Invalid data will be skipped with a warning</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleImport} 
              disabled={!file || loading}
            >
              {loading ? 'Importing...' : 'Import Leads'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
