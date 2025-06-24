
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
            const lines = text.split('\n').filter(line => line.trim());
            if (lines.length === 0) {
              reject(new Error('CSV file is empty'));
              return;
            }
            
            const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, '').toLowerCase());
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
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { raw: false });
            
            // Normalize headers to lowercase for consistency
            const normalizedData = jsonData.map((row: any) => {
              const normalizedRow: any = {};
              Object.keys(row).forEach(key => {
                normalizedRow[key.toLowerCase().trim()] = row[key];
              });
              return normalizedRow;
            });
            
            resolve(normalizedData);
          }
        } catch (error) {
          console.error('Error processing file:', error);
          reject(new Error(`Failed to process file: ${error instanceof Error ? error.message : 'Unknown error'}`));
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

  const validateAndNormalizeData = (fileData: any[]): { data: any[], errors: string[] } => {
    const errors: string[] = [];
    const validData: any[] = [];
    const validPayments = ['hrdc', 'individual'];
    const validPrograms = [
      'Business Writing with AI: 2-Day Masterclass',
      'The AI-Ready Leader: Win the Future with Strategic Action', 
      'ChatGPT Skill Boost (Intermediate)',
      'AI and ChatGPT for HR Professionals - 2 Day Masterclass'
    ];

    // Check required columns
    const requiredColumns = ['name', 'email', 'phone', 'org', 'role', 'payment', 'product_type'];
    if (fileData.length === 0) {
      errors.push('File contains no data rows');
      return { data: [], errors };
    }

    const firstRow = fileData[0];
    const availableColumns = Object.keys(firstRow).map(k => k.toLowerCase());
    const missingColumns = requiredColumns.filter(col => !availableColumns.includes(col));
    
    if (missingColumns.length > 0) {
      errors.push(`Missing required columns: ${missingColumns.join(', ')}`);
      return { data: [], errors };
    }

    // Validate each row
    fileData.forEach((row, index) => {
      const rowNumber = index + 2; // +2 because Excel/CSV starts at 1 and we skip header
      const rowErrors: string[] = [];

      // Validate required fields
      if (!row.name || !row.email) {
        rowErrors.push(`Row ${rowNumber}: Missing required name or email`);
      }

      // Validate payment
      const payment = row.payment?.toLowerCase().trim();
      if (payment && !validPayments.includes(payment)) {
        rowErrors.push(`Row ${rowNumber}: Invalid payment "${row.payment}". Must be "hrdc" or "individual"`);
      }

      // Validate program title
      let programTitle = row.product_type?.trim();
      if (row.product_id) {
        programTitle = supabaseProspectService.translateProductId(row.product_id);
      }
      
      if (!programTitle) {
        rowErrors.push(`Row ${rowNumber}: Missing program information`);
      } else if (!validPrograms.includes(programTitle)) {
        rowErrors.push(`Row ${rowNumber}: Invalid program "${programTitle}". Must be exact match from available programs`);
      }

      if (rowErrors.length > 0) {
        errors.push(...rowErrors);
      } else {
        validData.push({
          ...row,
          payment: payment || null,
          product_type: programTitle
        });
      }
    });

    return { data: validData, errors };
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setIsUploading(true);

    try {
      console.log('Starting file processing...');
      const fileData = await processFile(selectedFile);
      console.log('File processed, validating data...', fileData);
      
      const { data: validData, errors } = validateAndNormalizeData(fileData);
      
      if (errors.length > 0) {
        const maxErrorsToShow = 10;
        const errorMessage = errors.slice(0, maxErrorsToShow).join('\n');
        const additionalErrors = errors.length > maxErrorsToShow ? `\n... and ${errors.length - maxErrorsToShow} more errors` : '';
        
        throw new Error(`Validation failed:\n${errorMessage}${additionalErrors}`);
      }

      if (validData.length === 0) {
        throw new Error('No valid data found after processing');
      }

      console.log('Getting programs for mapping...');
      const { data: programs } = await supabaseProspectService.getPrograms();
      const programsMap = programs?.reduce((acc, program) => {
        acc[program.title] = program.id;
        return acc;
      }, {} as Record<string, string>) || {};

      const prospects = validData.map((row: any) => {
        const programId = programsMap[row.product_type];
        
        if (!programId) {
          throw new Error(`Program "${row.product_type}" not found in registration programs`);
        }
        
        return {
          program_id: programId,
          name: row.name,
          email: row.email,
          phone: row.phone || null,
          org: row.org || null,
          role: row.role || null,
          payment: row.payment || null,
          product_type: row.product_type,
          product_id: row.product_id || null,
          registration_status: 'Pending' as const
        };
      });

      console.log('Uploading prospects to database...', prospects);
      const { error } = await supabaseProspectService.bulkUploadProspects(prospects);

      if (error) {
        console.error('Database error:', error);
        throw new Error(`Database error: ${error.message}`);
      }
      
      toast({
        title: "Success",
        description: `Successfully uploaded ${prospects.length} prospects.`,
      });

      setSelectedFile(null);
      const fileInput = document.getElementById('file') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
    } catch (error: any) {
      console.error('Upload failed:', error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload file. Please check the file format and data.",
        variant: "destructive",
      });
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
            <h4 className="font-medium text-blue-900 mb-2">File Format Requirements:</h4>
            <p className="text-sm text-blue-700 mb-2">
              Required columns (case-insensitive headers):
            </p>
            <ul className="text-sm text-blue-700 list-disc list-inside space-y-1">
              <li><strong>name</strong> - Full name (required)</li>
              <li><strong>email</strong> - Email address (required)</li>
              <li><strong>phone</strong> - Phone number</li>
              <li><strong>org</strong> - Organization</li>
              <li><strong>role</strong> - Job role</li>
              <li><strong>payment</strong> - ONLY "hrdc" or "individual" (case-insensitive)</li>
              <li><strong>product_type</strong> - EXACT program name (see below)</li>
            </ul>
            
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
              <p className="text-xs text-red-800 font-medium">⚠️ STRICT REQUIREMENTS:</p>
              <p className="text-xs text-red-700">
                • Payment: ONLY "hrdc" or "individual" (any other value will fail)<br/>
                • Program: Must use EXACT program titles (copy-paste recommended)<br/>
                • Headers: Can be any case but must contain required column names
              </p>
            </div>
            
            <div className="mt-2 p-3 bg-blue-100 rounded">
              <p className="text-xs text-blue-800 font-medium">Exact Program Titles (copy these):</p>
              <div className="text-xs text-blue-700 mt-1 space-y-1">
                <div>• Business Writing with AI: 2-Day Masterclass</div>
                <div>• The AI-Ready Leader: Win the Future with Strategic Action</div>
                <div>• ChatGPT Skill Boost (Intermediate)</div>
                <div>• AI and ChatGPT for HR Professionals - 2 Day Masterclass</div>
              </div>
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
            {isUploading ? 'Processing and Uploading...' : 'Upload Prospects'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default BulkUploadForm;
