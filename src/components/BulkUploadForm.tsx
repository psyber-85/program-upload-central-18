import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Program {
  id: string;
  title: string;
}

const BulkUploadForm = () => {
  const [programmes, setProgrammes] = useState<Program[]>([]);
  const [selectedProgramme, setSelectedProgramme] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      const { data, error } = await supabase
        .from('programs')
        .select('id, title')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setProgrammes(data || []);
    } catch (error) {
      console.error('Error fetching programs:', error);
      toast({
        title: "Error",
        description: "Failed to load programs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = [
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ];
      
      if (validTypes.includes(file.type) || file.name.endsWith('.xls') || file.name.endsWith('.xlsx')) {
        setSelectedFile(file);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please select an Excel file (.xls or .xlsx)",
          variant: "destructive",
        });
      }
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProgramme || !selectedFile) return;

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('programmeId', selectedProgramme);
      formData.append('file', selectedFile);

      // TODO: Replace with actual Supabase file processing when participants table is ready
      console.log('Uploading file:', selectedFile.name, 'for programme:', selectedProgramme);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Success",
        description: `Successfully uploaded ${selectedFile.name}. Prospects have been added to the system.`,
      });

      // Reset form
      setSelectedProgramme('');
      setSelectedFile(null);
      const fileInput = document.getElementById('file') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload file. Please try again.",
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
        <CardDescription>Upload an Excel file to add multiple prospects at once</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleUpload} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="programme">Programme</Label>
            <select
              id="programme"
              value={selectedProgramme}
              onChange={(e) => setSelectedProgramme(e.target.value)}
              required
              disabled={loading}
              className="w-full h-10 px-3 py-2 border border-input bg-background rounded-md disabled:opacity-50"
            >
              <option value="">
                {loading ? 'Loading programs...' : 'Select a programme...'}
              </option>
              {programmes.map((programme) => (
                <option key={programme.id} value={programme.id}>
                  {programme.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="file">Excel File</Label>
            <Input
              id="file"
              type="file"
              accept=".xls,.xlsx"
              onChange={handleFileChange}
              required
            />
          </div>

          <div className="md:col-span-2">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">File Format Instructions:</h4>
              <p className="text-sm text-blue-700 mb-2">
                The Excel file should have the following columns in the first row:
              </p>
              <ul className="text-sm text-blue-700 list-disc list-inside space-y-1">
                <li>Name</li>
                <li>Email</li>
                <li>Phone</li>
                <li>Company</li>
                <li>Job Role</li>
              </ul>
            </div>
          </div>

          {selectedFile && (
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <Upload className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700">{selectedFile.name}</span>
                <span className="text-xs text-gray-500">
                  ({(selectedFile.size / 1024).toFixed(1)} KB)
                </span>
              </div>
            </div>
          )}

          <div className="md:col-span-2">
            <Button 
              type="submit" 
              disabled={isUploading || !selectedProgramme || !selectedFile || loading}
              className="w-full"
            >
              {isUploading ? 'Uploading...' : 'Upload Prospects'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default BulkUploadForm;
