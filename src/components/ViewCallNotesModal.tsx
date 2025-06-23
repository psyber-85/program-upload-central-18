
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Eye, Phone } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface CallNote {
  id: string;
  call_date: string;
  notes: string | null;
}

interface ViewCallNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  prospectId: string;
}

const ViewCallNotesModal: React.FC<ViewCallNotesModalProps> = ({
  isOpen,
  onClose,
  prospectId
}) => {
  const [callNotes, setCallNotes] = useState<CallNote[]>([]);
  const [prospectName, setProspectName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && prospectId) {
      loadCallNotes();
    }
  }, [isOpen, prospectId]);

  const loadCallNotes = async () => {
    try {
      setLoading(true);
      
      // Load prospect name
      const { data: prospectData, error: prospectError } = await supabase
        .from('prospects')
        .select('name')
        .eq('id', prospectId)
        .single();

      if (prospectError) throw prospectError;
      setProspectName(prospectData.name);

      // Load call notes
      const { data: callsData, error: callsError } = await supabase
        .from('prospect_calls')
        .select('id, call_date, notes')
        .eq('prospect_id', prospectId)
        .order('call_date', { ascending: false });

      if (callsError) throw callsError;

      setCallNotes(callsData || []);
    } catch (error) {
      console.error('Failed to load call notes:', error);
      toast({
        title: "Error",
        description: "Failed to load call notes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setCallNotes([]);
    setProspectName('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Call History - {prospectName}
          </DialogTitle>
          <DialogDescription>
            View all call notes for this prospect
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : callNotes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Phone className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No call notes found for this prospect</p>
            </div>
          ) : (
            callNotes.map((call) => (
              <div key={call.id} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm text-gray-600">
                    Call Date: {new Date(call.call_date).toLocaleString()}
                  </h4>
                </div>
                <div className="text-sm">
                  <strong>Notes:</strong>
                  <p className="mt-1 text-gray-700 whitespace-pre-wrap">
                    {call.notes || 'No notes recorded for this call'}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
        
        <div className="flex justify-end">
          <Button onClick={handleClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewCallNotesModal;
