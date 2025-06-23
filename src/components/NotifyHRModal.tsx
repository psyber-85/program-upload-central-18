
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface NotifyHRModalProps {
  isOpen: boolean;
  onClose: () => void;
  prospectId: string;
  onComplete: () => void;
}

// Programme-specific email templates
const templates = {
  "Business Writing with AI Masterclass": {
    subject: "Business Writing with AI – Sign-Up Form",
    body: `Dear [HR Name],

We recently spoke with [Prospect Name] about our "Business Writing with AI Masterclass." Attached is the sign-up form. Please confirm if you'd like to proceed.

Regards, AIHQ Team`
  },
  "ChatGPT Skill Boost Masterclass": {
    subject: "Invitation: ChatGPT Skill Boost Masterclass",
    body: `Dear [HR Name],

[Prospect Name] expressed interest in our "ChatGPT Skill Boost Masterclass." Attached is the sign-up form. Let us know how you'd like to proceed.

Best, AIHQ Team`
  },
  default: {
    subject: "Programme Sign-Up Form",
    body: `Dear [HR Name],

We recently spoke with [Prospect Name] about our programme. Attached is the sign-up form. Please confirm if you'd like to proceed.

Best regards, AIHQ Team`
  }
};

const NotifyHRModal: React.FC<NotifyHRModalProps> = ({
  isOpen,
  onClose,
  prospectId,
  onComplete
}) => {
  const [formData, setFormData] = useState({
    subject: '',
    body: ''
  });
  const [prospectData, setProspectData] = useState<any>(null);
  const [hrContactId, setHrContactId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && prospectId) {
      loadProspectAndHRData();
    }
  }, [isOpen, prospectId]);

  const loadProspectAndHRData = async () => {
    try {
      // Load prospect data with program info
      const { data: prospectData, error: prospectError } = await supabase
        .from('prospects')
        .select(`
          *,
          programs(title),
          hr_contacts(*)
        `)
        .eq('id', prospectId)
        .single();

      if (prospectError) throw prospectError;

      setProspectData(prospectData);
      
      // Set HR contact ID if exists
      if (prospectData.hr_contacts && prospectData.hr_contacts.length > 0) {
        setHrContactId(prospectData.hr_contacts[0].id);
      }

      // Set email template based on program
      const programTitle = prospectData.programs?.title || 'Unknown Program';
      const template = templates[programTitle as keyof typeof templates] || templates.default;
      
      // Replace placeholders
      const hrName = prospectData.hr_contacts?.[0]?.name || '[HR Name]';
      const prospectName = prospectData.name || '[Prospect Name]';
      
      setFormData({
        subject: template.subject,
        body: template.body
          .replace(/\[HR Name\]/g, hrName)
          .replace(/\[Prospect Name\]/g, prospectName)
      });
    } catch (error) {
      console.error('Failed to load prospect data:', error);
      toast({
        title: "Error",
        description: "Failed to load prospect information",
        variant: "destructive",
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hrContactId || !prospectData?.hr_contacts?.[0]?.email) {
      toast({
        title: "Error",
        description: "No HR contact found for this prospect",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.functions.invoke('send-hr-notification', {
        body: {
          to: prospectData.hr_contacts[0].email,
          subject: formData.subject,
          body: formData.body,
          hrContactId: hrContactId
        }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Email notification sent successfully! HR contact has been notified.",
      });

      onComplete();
      onClose();
    } catch (error) {
      console.error('Failed to send email:', error);
      toast({
        title: "Error",
        description: "Failed to send email notification. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({ subject: '', body: '' });
    setProspectData(null);
    setHrContactId(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Notify HR
          </DialogTitle>
          <DialogDescription>
            Send programme-specific email with sign-up form attachment
            {prospectData && (
              <span className="block mt-1">
                To: {prospectData.hr_contacts?.[0]?.email || 'No HR email found'}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="body">Email Body</Label>
              <Textarea
                id="body"
                name="body"
                value={formData.body}
                onChange={handleChange}
                rows={8}
                required
              />
            </div>

            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                📎 Sign-up form PDF will be automatically attached to this email
              </p>
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !hrContactId}>
              {isSubmitting ? 'Sending...' : 'Send Email'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NotifyHRModal;
