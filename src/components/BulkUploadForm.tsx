
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import * as XLSX from 'xlsx';

// Product ID to Program Title translation mapping
const PRODUCT_ID_TRANSLATIONS: Record<string, string> = {
  'business-writing-ai': 'Business Writing with AI: 2-Day Masterclass',
  'ai-ready-leader': 'The AI-Ready Leader: Win the Future with Strategic Action',
  'chatgpt-skill-boost': 'ChatGPT Skill Boost (Intermediate)',
  'ai-chatgpt-hr': 'AI and ChatGPT for HR Professionals - 2 Day Masterclass'
};

const BulkUploadForm = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const translateProductId = (productId: string): string => {
    return PRODUCT_ID_TRANSLATIONS[productId] || productId;
  };

  // Function to normalize payment values
  const normalizePayment = (payment: string): string | null => {
    if (!payment || payment.trim() === '') return null;
    
    const normalized = payment.toLowerCase().trim();
    
    // Map common variations to our allowed values
    switch (normalized) {
      // Standard business payment types
      case 'hrdc':
      case 'hrdf':
        return 'hrdc';
      case 'individual':
      case 'self-funded':
      case 'personal':
        return 'individual';
      // Standard payment statuses
      case 'paid':
      case 'complete':
      case 'completed':
      case 'success':
      case 'successful':
        return 'paid';
      case 'pending':
      case 'processing':
      case 'in progress':
      case 'waiting':
        return 'pending';
      case 'failed':
      case 'failure':
      case 'unsuccessful':
      case 'declined':
      case 'rejected':
        return 'failed';
      default:
        // If we can't map it, return the original value (lowercased)
        console.warn(`Unknown payment status: ${payment}, keeping as: ${normalized}`);
        return normalized;
    }
  };

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
            // Process CSV file
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
            // Process Excel file
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
      // Process file
      const fileData = await processFile(selectedFile);
      
      if (fileData.length === 0) {
        throw new Error('No data found in file');
      }

      // Validate required columns
      const requiredColumns = ['name', 'email', 'phone', 'org', 'role', 'payment', 'product_type'];
      const firstRow = fileData[0] as any;
      const missingColumns = requiredColumns.filter(col => !(col in firstRow));
      
      if (missingColumns.length > 0) {
        throw new Error(`Missing required columns: ${missingColumns.join(', ')}`);
      }

      // Group data by program and process each group
      const programGroups: Record<string, any[]> = {};
      
      fileData.forEach((row: any) => {
        let programTitle = row.product_type;
        
        // Translate product_id if present
        if (row.product_id) {
          programTitle = translateProductId(row.product_id);
        }
        
        if (!programTitle) {
          throw new Error('Program information missing in data');
        }
        
        if (!programGroups[programTitle]) {
          programGroups[programTitle] = [];
        }
        
        programGroups[programTitle].push({
          name: row.name,
          email: row.email,
          phone: row.phone || null,
          org: row.org || null,
          role: row.role || null,
          payment: normalizePayment(row.payment),
          registration_status: 'Pending'
        });
      });

      let totalInserted = 0;
      
      // Process each program group
      for (const [programTitle, prospects] of Object.entries(programGroups)) {
        // Get program_id from registration_programs
        const { data: existingProgram, error: fetchError } = await supabase
          .from('registration_programs')
          .select('id')
          .eq('title', programTitle)
          .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
          throw fetchError;
        }

        if (!existingProgram) {
          throw new Error(`Program "${programTitle}" not found in registration_programs. Please add it first.`);
        }

        // Add program_id to prospects (remove product_type)
        const prospectsWithProgramId = prospects.map(prospect => ({
          ...prospect,
          program_id: existingProgram.id
        }));

        // Insert prospects
        const { error: insertError } = await supabase
          .from('prospects')
          .insert(prospectsWithProgramId);

        if (insertError) throw insertError;
        
        totalInserted += prospects.length;
      }
      
      toast({
        title: "Success",
        description: `Successfully uploaded ${totalInserted} prospects across ${Object.keys(programGroups).length} program(s). All prospects are now linked to programs via program_id.`,
      });

      // Reset form
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
              <li>name</li>
              <li>email</li>
              <li>phone</li>
              <li>org</li>
              <li>role</li>
              <li>payment (accepts: hrdc/individual for payment types, or paid/pending/failed for status)</li>
              <li>product_type (program name - must match exactly with programs in registration_programs table)</li>
              <li>product_id (optional - will be automatically translated to program titles)</li>
            </ul>
            <div className="mt-3 p-3 bg-blue-100 rounded">
              <p className="text-xs text-blue-800 font-medium">Program Matching & Payment Handling:</p>
              <p className="text-xs text-blue-700">
                Program names must match exactly with those in the registration_programs table. 
                Each prospect will be assigned a program_id based on the program name match.
                Payment values will be automatically normalized - "HRDC"/"HRDF" → "hrdc", "Individual"/"Self-funded" → "individual".
                Common payment status variations are also supported (e.g., "Paid" → "paid", "Processing" → "pending").
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
