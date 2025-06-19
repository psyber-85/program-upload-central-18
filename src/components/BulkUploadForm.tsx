
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Programme {
  id: string;
  name: string;
}

const BulkUploadForm = () => {
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [selectedProgramme, setSelectedProgramme] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // TODO: fetch('/api/programmes')
    fetch('/api/programmes')
      .then(r => r.json())
      .then(setProgrammes)
      .catch(console.error);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase();
      if (fileExtension === 'xls' || fileExtension === 'xlsx') {
        setFile(selectedFile);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please select an Excel file (.xls or .xlsx)",
          variant: "destructive",
        });
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedProgramme || !file) {
      toast({
        title: "Missing information",
        description: "Please select a programme and upload a file",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('programmeId', selectedProgramme);
      formData.append('file', file);

      // TODO: fetch('/api/prospects/upload', { method: 'POST', body: formData })
      await fetch('/api/prospects/upload', {
        method: 'POST',
        body: formData
      });

      toast({
        title: "Upload successful",
        description: "Prospects have been uploaded successfully",
      });

      // Reset form
      setSelectedProgramme('');
      setFile(null);
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "There was an error uploading the file",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Bulk Upload Prospects
        </CardTitle>
        <CardDescription>
          Upload multiple prospects from an Excel file
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="programme">Programme</Label>
            <select
              id="programme"
              value={selectedProgramme}
              onChange={(e) => setSelectedProgramme(e.target.value)}
              className="w-full h-10 px-3 py-2 border border-input bg-background rounded-md"
            >
              <option value="">Select a programme...</option>
              {programmes.map((programme) => (
                <option key={programme.id} value={programme.id}>
                  {programme.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">Excel File</Label>
            <Input
              id="file"
              type="file"
              accept=".xls,.xlsx"
              onChange={handleFileChange}
            />
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">File Format Instructions</h4>
          <p className="text-sm text-blue-700">
            First row should contain headers: Name, Email, Phone, Company, Job Role
          </p>
        </div>

        <div className="mt-6">
          <Button
            onClick={handleUpload}
            disabled={!selectedProgramme || !file || isUploading}
            className="w-full"
          >
            {isUploading ? 'Uploading...' : 'Upload Prospects'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default BulkUploadForm;
