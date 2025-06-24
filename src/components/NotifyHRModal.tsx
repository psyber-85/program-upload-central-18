
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Paperclip } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface NotifyHRModalProps {
  isOpen: boolean;
  onClose: () => void;
  prospectId: string;
  onComplete: () => void;
}

interface ProspectData {
  name: string;
  email: string;
  program_id: string;
  hrContact?: {
    name: string;
    email: string;
  };
}

const NotifyHRModal: React.FC<NotifyHRModalProps> = ({
  isOpen,
  onClose,
  prospectId,
  onComplete
}) => {
  const [prospectData, setProspectData] = useState<ProspectData | null>(null);
  const [programName, setProgramName] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [attachmentPlaceholder, setAttachmentPlaceholder] = useState('Course Brochure.pdf, Sign-Up Form.pdf');
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && prospectId) {
      fetchProspectData();
    }
  }, [isOpen, prospectId]);

  const fetchProspectData = async () => {
    try {
      // Fetch prospect data with HR contact
      const { data: prospectData, error: prospectError } = await supabase
        .from('prospects')
        .select(`
          name,
          email,
          program_id,
          hr_contacts(name, email)
        `)
        .eq('id', prospectId)
        .single();

      if (prospectError) throw prospectError;

      // Fetch program name
      const { data: programData, error: programError } = await supabase
        .from('programs')
        .select('title')
        .eq('id', prospectData.program_id)
        .single();

      if (programError) throw programError;

      const hrContact = prospectData.hr_contacts?.[0];
      
      setProspectData({
        ...prospectData,
        hrContact: hrContact ? {
          name: hrContact.name,
          email: hrContact.email
        } : undefined
      });

      setProgramName(programData.title);

      // Set default subject and body
      const defaultSubject = `[AIHQ] Signing up for ${programData.title}`;
      const defaultBody = `Dear ${hrContact?.name || '[HR Contact Name]'},

As discussed, I am reaching out to provide the necessary details for the ${programData.title} that your employee, ${prospectData.name}, would like to attend.

Attached you will find:

- The course brochure with a detailed outline of the program.
- The Sign-Up Form for the registration process.

Please kindly review these documents for approval. Should you have any questions or require further clarification, feel free to contact me directly.

We look forward to assisting your team in enhancing their future skills through AI upskilling through this innovative program.

Warm regards,
AIHQ`;

      setSubject(defaultSubject);
      setBody(defaultBody);

    } catch (error) {
      console.error('Error fetching prospect data:', error);
      toast({
        title: "Error",
        description: "Failed to load prospect data",
        variant: "destructive",
      });
    }
  };

  const handleSendEmail = async () => {
    if (!prospectData?.hrContact) {
      toast({
        title: "Error",
        description: "No HR contact found for this prospect",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    try {
      // Call the send-hr-notification Edge Function
      const { data, error } = await supabase.functions.invoke('send-hr-notification', {
        body: {
          hrContactEmail: prospectData.hrContact.email,
          hrContactName: prospectData.hrContact.name,
          prospectName: prospectData.name,
          programName: programName,
          subject: subject,
          body: body,
          attachments: attachmentPlaceholder.split(',').map(name => name.trim()).filter(name => name)
        }
      });

      if (error) throw error;

      // Update HR contact to mark email as sent
      const { error: updateError } = await supabase
        .from('hr_contacts')
        .update({ email_sent_at: new Date().toISOString() })
        .eq('prospect_id', prospectId);

      if (updateError) throw updateError;

      toast({
        title: "Success",
        description: "HR notification email sent successfully!",
      });

      onComplete();
      onClose();
    } catch (error) {
      console.error('Failed to send HR notification:', error);
      toast({
        title: "Error",
        description: "Failed to send HR notification. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleClose = () => {
    setProspectData(null);
    setProgramName('');
    setSubject('');
    setBody('');
    setAttachmentPlaceholder('Course Brochure.pdf, Sign-Up Form.pdf');
    onClose();
  };

  if (!prospectData) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Send HR Notification
          </DialogTitle>
          <DialogDescription>
            Send notification email to HR contact for {prospectData.name}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Participant</Label>
              <p className="text-sm text-gray-600">{prospectData.name}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Programme</Label>
              <p className="text-sm text-gray-600">{programName}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">HR Contact</Label>
              <p className="text-sm text-gray-600">{prospectData.hrContact?.name || 'N/A'}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">HR Email</Label>
              <p className="text-sm text-gray-600">{prospectData.hrContact?.email || 'N/A'}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Email Subject</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="body">Email Body</Label>
            <Textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Email body"
              rows={12}
              className="resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="attachments" className="flex items-center gap-2">
              <Paperclip className="w-4 h-4" />
              Attachments (Placeholder)
            </Label>
            <Input
              id="attachments"
              value={attachmentPlaceholder}
              onChange={(e) => setAttachmentPlaceholder(e.target.value)}
              placeholder="Attachment file names (comma-separated)"
            />
            <p className="text-xs text-gray-500">
              Enter placeholder attachment names. Actual file attachments will be implemented in a future update.
            </p>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSendEmail} 
            disabled={isSending || !prospectData.hrContact?.email || !subject.trim() || !body.trim()}
          >
            {isSending ? 'Sending...' : 'Send Email'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NotifyHRModal;
