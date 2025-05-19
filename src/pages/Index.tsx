
import { useState } from 'react';
import ProgramManager from '../components/ProgramManager';
import FileUploader from '../components/FileUploader';
import DataTable from '../components/DataTable';
import { supabase } from '../supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

const Index = () => {
  const [selectedProgram, setSelectedProgram] = useState('');
  const [parsedData, setParsedData] = useState([]);
  const [fileNames, setFileNames] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      toast.error('Please select a program');
      return;
    }

    if (parsedData.length === 0) {
      toast.error('Please upload and parse participant data');
      return;
    }

    try {
      setIsSubmitting(true);
      toast.info(`Processing ${parsedData.length} participants from ${fileNames.split(', ').length} file(s)...`);
      
      // Prepare the payload in the required format
      const payload = {
        program: selectedProgram,
        data: parsedData
      };

      // Call the Supabase function to process data and send emails
      const { data, error } = await supabase.functions.invoke('process-participants', {
        body: payload
      });

      if (error) throw error;

      if (data.success) {
        toast.success(`Successfully processed ${data.results.length} participants`);
        handleReset();
      } else {
        throw new Error(data.message || 'Failed to process participants');
      }
    } catch (error) {
      console.error('Error submitting data:', error);
      toast.error('Failed to submit data. Please try again.');
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
