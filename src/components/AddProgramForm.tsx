
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Plus } from 'lucide-react';

interface AddProgramFormProps {
  onProgramAdded?: () => void;
}

const AddProgramForm = ({ onProgramAdded }: AddProgramFormProps) => {
  const [programTitle, setProgramTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

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

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase
        .from('programs')
        .insert([{ title: programTitle.trim() }])
        .select();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Program added successfully!",
      });

      setProgramTitle('');
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Add New Program
        </CardTitle>
        <CardDescription>Create a new training program for prospect registration</CardDescription>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  );
};

export default AddProgramForm;
