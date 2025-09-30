
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useRegistration } from '@/lib/registration/RegistrationContext';

interface AddProgramFormProps {
  onProgramAdded?: () => void;
}

const AddProgramForm = ({ onProgramAdded }: AddProgramFormProps) => {
  const [programTitle, setProgramTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { activeRoundId, refreshPrograms } = useRegistration();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!programTitle.trim()) {
      toast({
        title: "Error",
        description: "Program title cannot be empty",
        variant: "destructive",
      });
      return;
    }

    if (!activeRoundId) {
      toast({
        title: "Error",
        description: "Please select a registration round first",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('registration_programs')
        .insert([{ 
          title: programTitle.trim(),
          round_id: activeRoundId
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Program added successfully!",
      });

      setProgramTitle('');
      await refreshPrograms();
      
      if (onProgramAdded) {
        onProgramAdded();
      }
    } catch (error) {
      console.error('Error adding program:', error);
      toast({
        title: "Error",
        description: "Failed to add program. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="programTitle">Program Title</Label>
        <Input
          id="programTitle"
          value={programTitle}
          onChange={(e) => setProgramTitle(e.target.value)}
          placeholder="Enter program title..."
          required
          className="mt-1"
        />
      </div>
      <Button 
        type="submit" 
        disabled={isSubmitting || !programTitle.trim()}
        className="w-full"
      >
        {isSubmitting ? 'Adding Program...' : 'Add Program'}
      </Button>
    </form>
  );
};

export default AddProgramForm;
