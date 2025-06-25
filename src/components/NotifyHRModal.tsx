
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface NotifyHRModalProps {
  isOpen: boolean;
  onClose: () => void;
  prospectId: string;
  onComplete: () => void;
}

const NotifyHRModal: React.FC<NotifyHRModalProps> = ({
  isOpen,
  onClose,
  prospectId,
  onComplete
}) => {
  const [prospectData, setProspectData] = useState<any>(null);
  const [programData, setProgramData] = useState<any>(null);
  const [hrContact, setHrContact] = useState<any>(null);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && prospectId) {
      loadProspectData();
    }
  }, [isOpen, prospectId]);

  const loadProspectData = async () => {
    try {
      // First fetch the prospect data
      const { data: prospect, error: prospectError } = await supabase
        .from('prospects')
        .select(`
          *,
          hr_contacts(*)
        `)
        .eq('id', prospectId)
        .single();

      if (prospectError) throw prospectError;

      setProspectData(prospect);
      
      // Then fetch the program data separately if program_id exists
      if (prospect.program_id) {
        const { data: program, error: programError } = await supabase
          .from('programs')
          .select('*')
          .eq('id', prospect.program_id)
          .single();

        if (programError) {
          console.error('Program fetch error:', programError);
        } else {
          setProgramData(program);
        }
      }
      
      if (prospect.hr_contacts && prospect.hr_contacts.length > 0) {
        const hrContactData = prospect.hr_contacts[0];
        setHrContact(hrContactData);
        
        // Set default email subject and body
        const programTitle = programData?.title || 'Training Program';
        setEmailSubject(`Training Registration Confirmation - ${prospect.name}`);
        setEmailBody(`Dear ${hrContactData.name},

I hope this message finds you well.

I am writing to confirm the training registration for ${prospect.name} from your organization (${prospect.org || 'your company'}) for the "${programTitle}" program.

Participant Details:
- Name: ${prospect.name}
- Email: ${prospect.email}
- Role: ${prospect.role || 'Not specified'}
- Registration Status: ${prospect.registration_status}

Please review and confirm this registration at your earliest convenience. If you have any questions or need additional information, please don't hesitate to reach out.

Thank you for your time and cooperation.

Best regards,
Training Administration Team`);
      }
    } catch (error) {
      console.error('Failed to load prospect data:', error);
      toast({
        title: "Error",
        description: "Failed to load prospect data",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hrContact || !emailSubject.trim() || !emailBody.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Call the SendGrid edge function
      const { data, error } = await supabase.functions.invoke('send-hr-notification', {
        body: {
          to_email: hrContact.email,
          to_name: hrContact.name,
          subject: emailSubject,
          message: emailBody,
          prospect_name: prospectData?.name,
          program_title: programData?.title || 'Training Program'
        }
      });

      if (error) {
        console.error('SendGrid function error:', error);
        throw new Error(error.message || 'Failed to send email');
      }

      // Update HR contact to mark email as sent
      const { error: updateError } = await supabase
        .from('hr_contacts')
        .update({ 
          email_sent_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', hrContact.id);

      if (updateError) {
        console.error('Failed to update HR contact:', updateError);
        // Don't throw here as the email was sent successfully
      }

      toast({
        title: "Success",
        description: `Email sent successfully to ${hrContact.name}`,
      });

      onComplete();
      onClose();
    } catch (error: any) {
      console.error('Failed to send email:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send email. Please check your SendGrid configuration.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setProspectData(null);
    setProgramData(null);
    setHrContact(null);
    setEmailSubject('');
    setEmailBody('');
    onClose();
  };

  if (!hrContact) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>No HR Contact</DialogTitle>
            <DialogDescription>
              No HR contact has been added for this prospect yet. Please add an HR contact first.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={handleClose}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Send HR Notification
          </DialogTitle>
          <DialogDescription>
            Send an email notification to {hrContact.name} ({hrContact.email})
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Email Subject</Label>
              <Input
                id="subject"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                required
                placeholder="Enter email subject"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="body">Email Message</Label>
              <Textarea
                id="body"
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                required
                className="min-h-[300px]"
                placeholder="Enter your email message"
              />
            </div>

            <div className="p-3 bg-gray-50 rounded text-sm">
              <strong>Recipient:</strong> {hrContact.name} ({hrContact.email})
              {hrContact.email_sent_at && (
                <div className="mt-1 text-green-600">
                  ✅ Previous email sent: {new Date(hrContact.email_sent_at).toLocaleString()}
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Sending...' : 'Send Email'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NotifyHRModal;
