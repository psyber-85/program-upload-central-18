
import { useState } from 'react';
import ProgramManager from '../components/ProgramManager';
import FileUploader from '../components/FileUploader';
import DataTable from '../components/DataTable';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';

const Index = () => {
  const [selectedProgram, setSelectedProgram] = useState('');
  const [parsedData, setParsedData] = useState([]);
  const [fileNames, setFileNames] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleDataParsed = (data, names) => {
    setParsedData(data);
    setFileNames(names);
  };

  const handleReset = () => {
    setParsedData([]);
    setFileNames('');
    setSelectedProgram('');
  };

  const handleSubmit = async () => {
    if (!selectedProgram) {
      toast({
        title: "Error",
        description: "Please select a program",
        variant: "destructive",
      });
      return;
    }

    if (parsedData.length === 0) {
      toast({
        title: "Error", 
        description: "Please upload and parse participant data",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      toast({
        title: "Processing",
        description: `Processing ${parsedData.length} participants from ${fileNames.split(', ').length} file(s)...`,
      });
      
      // Transform data to match edge function expectations
      const transformedData = parsedData.map((row: any) => ({
        name: row.name,
        email: row.email,
        nric_number: row.nric_number,
        phone: row.phone || '',
        keyskilllist: row.key_skills || '', // Transform key_skills to keyskilllist
        program_name: selectedProgram
      }));

      console.log('Calling process-participants edge function with data:', {
        program: selectedProgram,
        data: transformedData
      });

      // Call the edge function instead of direct database insertion
      const { data: result, error } = await supabase.functions.invoke('process-participants', {
        body: {
          program: selectedProgram,
          data: transformedData
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(error.message || 'Failed to process participants');
      }

      console.log('Edge function response:', result);

      if (!result.success) {
        throw new Error(result.message || 'Failed to process participants');
      }

      // Check results for any failures
      const successCount = result.results?.filter(r => r.status === 'success').length || 0;
      const errorCount = result.results?.filter(r => r.status === 'error').length || 0;
      
      if (errorCount > 0) {
        console.error('Some participants failed processing:', result.results.filter(r => r.status === 'error'));
        toast({
          title: "Partial Success",
          description: `${successCount} participants processed successfully, ${errorCount} failed. Check console for details.`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: `Successfully processed ${successCount} participants and sent confirmation emails`,
        });
      }
      
      handleReset();
    } catch (error: any) {
      console.error('Error submitting data:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isReadyToSubmit = selectedProgram && parsedData.length > 0;
  const fileCount = fileNames ? fileNames.split(', ').length : 0;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            National Training Week - Participant Upload
          </h1>
          <p className="text-gray-600 mt-2">
            Upload participant data for training programs and send automated emails
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <ProgramManager 
            selectedProgram={selectedProgram}
            setSelectedProgram={setSelectedProgram}
          />
          <FileUploader onDataParsed={handleDataParsed} />
        </div>

        {parsedData.length > 0 && (
          <>
            <div className="mb-2 text-sm text-gray-600">
              {fileCount > 1 ? (
                <p>Showing combined data from {fileCount} files: {fileNames}</p>
              ) : (
                <p>Showing data from: {fileNames}</p>
              )}
            </div>
            <DataTable data={parsedData.slice(0, 10)} />
          </>
        )}

        <div className="mt-8 flex justify-end gap-4">
          <Button
            variant="outline"
            onClick={handleReset}
            className="px-6 py-2"
          >
            Reset
          </Button>
          <Button
            variant="default"
            onClick={handleSubmit}
            disabled={!isReadyToSubmit || isSubmitting}
            className={`px-6 py-2 ${
              isReadyToSubmit && !isSubmitting
                ? ''
                : 'opacity-70 cursor-not-allowed'
            }`}
          >
            {isSubmitting 
              ? 'Processing...' 
              : parsedData.length > 0 
                ? `Submit ${parsedData.length} Participants` 
                : 'Submit Data'
            }
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
