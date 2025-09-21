
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload, FileText } from 'lucide-react';

const CertificateGenerator = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [programName, setProgramName] = useState('');
  const [programDate, setProgramDate] = useState('');
  const [excelFile, setExcelFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const allowedTypes = [
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid File Type",
          description: "Please select an Excel file (.xls or .xlsx)",
          variant: "destructive"
        });
        return;
      }
      
      setExcelFile(file);
      toast({
        title: "File Selected",
        description: `Selected: ${file.name}`,
      });
    }
  };

  const generateCertificates = async () => {
    if (!programName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a program name.",
        variant: "destructive"
      });
      return;
    }

    if (!programDate.trim()) {
      toast({
        title: "Error",
        description: "Please enter a program date.",
        variant: "destructive"
      });
      return;
    }

    if (!excelFile) {
      toast({
        title: "Error",
        description: "Please upload an Excel file with participant names.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('programName', programName);
      formData.append('programDate', programDate);
      formData.append('namesFile', excelFile);

      // Placeholder for certificate generation - would call Supabase Edge Function
      // const response = await fetch('/api/certificates/generate', {
      //   method: 'POST',
      //   body: formData
      // });

      // if (!response.ok) {
      //   throw new Error('Failed to generate certificates');
      // }

      // const blob = await response.blob();
      // const url = window.URL.createObjectURL(blob);
      // const link = document.createElement('a');
      // link.href = url;
      // link.setAttribute('download', `Certificates_${Date.now()}.zip`);
      // document.body.appendChild(link);
      // link.click();
      // link.parentNode?.removeChild(link);
      // window.URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Certificate generation feature will be implemented with Supabase Edge Functions.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate certificates.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setProgramName('');
    setProgramDate('');
    setExcelFile(null);
    // Reset file input
    const fileInput = document.getElementById('excel-file') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Certificate Generator</h1>
        <p className="text-muted-foreground mt-2">Generate personalized certificates for training participants</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Certificate Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="programName">Program Name</Label>
            <Input
              id="programName"
              value={programName}
              onChange={(e) => setProgramName(e.target.value)}
              placeholder="Enter program name"
            />
          </div>

          <div>
            <Label htmlFor="programDate">Program Date</Label>
            <Input
              id="programDate"
              type="date"
              value={programDate}
              onChange={(e) => setProgramDate(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="excel-file">Participant Names (Excel File)</Label>
            <div className="mt-2">
              <Input
                id="excel-file"
                type="file"
                accept=".xls,.xlsx"
                onChange={handleFileChange}
                className="cursor-pointer"
              />
              <p className="text-sm text-muted-foreground mt-2">
                Upload an Excel file with participant names in the first column
              </p>
            </div>
          </div>

          {excelFile && (
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{excelFile.name}</span>
              <span className="text-sm text-muted-foreground">
                ({(excelFile.size / 1024).toFixed(1)} KB)
              </span>
            </div>
          )}

          <div className="flex gap-4">
            <Button 
              onClick={generateCertificates} 
              disabled={loading || !programName || !programDate || !excelFile}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Generate Certificates
                </>
              )}
            </Button>
            
            <Button 
              onClick={resetForm} 
              variant="outline"
              disabled={loading}
            >
              Reset
            </Button>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">Instructions:</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Excel file should contain participant names in the first column</li>
              <li>• Each name will generate a separate certificate PDF</li>
              <li>• All certificates will be bundled into a ZIP file for download</li>
              <li>• Ensure names are spelled correctly before generating</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CertificateGenerator;
