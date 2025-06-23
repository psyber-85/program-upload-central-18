
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
      
      // First, get or create the program
      let programId;
      const { data: existingProgram, error: fetchError } = await supabase
        .from('programs')
        .select('id')
        .eq('title', selectedProgram)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      if (existingProgram) {
        programId = existingProgram.id;
      } else {
        // Create new program if it doesn't exist
        const { data: newProgram, error: createError } = await supabase
          .from('programs')
          .insert([{ title: selectedProgram }])
          .select('id')
          .single();

        if (createError) throw createError;
        programId = newProgram.id;
      }

      // Transform and insert participant data
      const participantsData = parsedData.map((row: any) => ({
        program_id: programId,
        program_name: selectedProgram,
        name: row.name,
        email: row.email,
        nric_number: row.nric_number,
        phone: row.phone || null,
        key_skills: row.key_skills || null,
        email_sent: false
      }));

      const { error: insertError } = await supabase
        .from('participants')
        .insert(participantsData);

      if (insertError) throw insertError;

      toast({
        title: "Success",
        description: `Successfully processed ${participantsData.length} participants`,
      });
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
