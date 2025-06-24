
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Upload } from 'lucide-react';
import { supabaseProspectService } from '@/services/supabaseProspectService';
import * as XLSX from 'xlsx';

const BulkUploadForm = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = [
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/csv'
      ];
      
      if (validTypes.includes(file.type) || 
          file.name.endsWith('.xls') || 
          file.name.endsWith('.xlsx') || 
          file.name.endsWith('.csv')) {
        setSelectedFile(file);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please select an Excel file (.xls, .xlsx) or CSV file (.csv)",
          variant: "destructive",
        });
      }
    }
  };

  const processFile = async (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          if (file.name.endsWith('.csv')) {
            const text = e.target?.result as string;
            const lines = text.split('\n');
            const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
            const jsonData = [];
            
            for (let i = 1; i < lines.length; i++) {
              if (lines[i].trim()) {
                const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
                const row: any = {};
                headers.forEach((header, index) => {
                  row[header] = values[index] || '';
                });
                jsonData.push(row);
              }
            }
            resolve(jsonData);
          } else {
            const data = new Uint8Array(e.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);
            resolve(jsonData);
          }
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      
      if (file.name.endsWith('.csv')) {
        reader.readAsText(file);
      } else {
        reader.readAsArrayBuffer(file);
      }
    });
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setIsUploading(true);

    try {
      const fileData = await processFile(selectedFile);
      
      if (fileData.length === 0) {
        throw new Error('No data found in file');
      }

      const requiredColumns = ['name', 'email', 'phone', 'org', 'role', 'payment', 'product_type'];
      const firstRow = fileData[0] as any;
      const missingColumns = requiredColumns.filter(col => !(col in firstRow));
      
      if (missingColumns.length > 0) {
        throw new Error(`Missing required columns: ${missingColumns.join(', ')}`);
      }

      const { data: programs } = await supabaseProspectService.getPrograms();
      const programsMap = programs?.reduce((acc, program) => {
        acc[program.title] = program.id;
        return acc;
      }, {} as Record<string, string>) || {};

      const prospects = fileData.map((row: any) => {
        let programTitle = row.product_type;
        
        if (row.product_id) {
          programTitle = supabaseProspectService.translateProductId(row.product_id);
        }
        
        if (!programTitle) {
          throw new Error('Program information missing in data');
        }

        const programId = programsMap[programTitle];
        
        if (!programId) {
          throw new Error(`Program "${programTitle}" not found in registration programs`);
        }
        
        return {
          program_id: programId,
          name: row.name,
          email: row.email,
          phone: row.phone || null,
          org: row.org || null,
          role: row.role || null,
          payment_status: row.payment || null,
          product_type: programTitle,
          product_id: row.product_id || null,
          registration_status: 'Pending' as const
        };
      });

      const { error } = await supabaseProspectService.bulkUploadProspects(prospects);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: `Successfully uploaded ${prospects.length} prospects. Payment types have been normalized to HRDC/Individual format.`,
      });

      setSelectedFile(null);
      const fileInput = document.getElementById('file') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload file. Please try again.",
        variant: "destructive",
      });
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bulk Upload Prospects</CardTitle>
        <CardDescription>Upload an Excel or CSV file to add multiple prospects at once</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <Label htmlFor="file">Excel or CSV File</Label>
            <Input
              id="file"
              type="file"
              accept=".xls,.xlsx,.csv"
              onChange={handleFileChange}
              required
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">File Format Instructions:</h4>
            <p className="text-sm text-blue-700 mb-2">
              The file should have the following columns in the first row:
            </p>
            <ul className="text-sm text-blue-700 list-disc list-inside space-y-1">
              <li>id (optional - for tracking purposes)</li>
              <li>name</li>
              <li>email</li>
              <li>phone</li>
              <li>org</li>
              <li>role</li>
              <li>payment (HRDC or Individual)</li>
              <li>product_type (program name)</li>
              <li>product_id (optional - will be automatically translated to program titles)</li>
            </ul>
            <div className="mt-3 p-3 bg-blue-100 rounded">
              <p className="text-xs text-blue-800 font-medium">Auto Program Detection & Payment Normalization:</p>
              <p className="text-xs text-blue-700">
                Programs will be automatically detected from the product_type or product_id columns. 
                Payment types will be automatically normalized to HRDC or Individual format.
                The ID column will be ignored during import but can be included for reference.
              </p>
            </div>
          </div>

          {selectedFile && (
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <Upload className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-700">{selectedFile.name}</span>
              <span className="text-xs text-gray-500">
                ({(selectedFile.size / 1024).toFixed(1)} KB)
              </span>
            </div>
          )}

          <Button 
            type="submit" 
            disabled={isUploading || !selectedFile}
            className="w-full"
          >
            {isUploading ? 'Uploading...' : 'Upload Prospects'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default BulkUploadForm;
