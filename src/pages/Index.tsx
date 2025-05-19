
import { useState } from 'react';
import ProgramManager from '../components/ProgramManager';
import FileUploader from '../components/FileUploader';
import DataTable from '../components/DataTable';
import { supabase } from '../supabase/client';
import { toast } from 'sonner';

const Index = () => {
  const [selectedProgram, setSelectedProgram] = useState('');
  const [parsedData, setParsedData] = useState([]);
  const [fileName, setFileName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDataParsed = (data, name) => {
    setParsedData(data);
    setFileName(name);
  };

  const handleReset = () => {
    setParsedData([]);
    setFileName('');
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
      toast.info(`Processing ${parsedData.length} participants...`);
      
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
          <DataTable data={parsedData.slice(0, 10)} />
        )}

        <div className="mt-8 flex justify-end gap-4">
          <button
            onClick={handleReset}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Reset
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isReadyToSubmit || isSubmitting}
            className={`px-6 py-2 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              isReadyToSubmit && !isSubmitting
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-blue-400 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Data'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Index;
