
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
  const [hrContact, setHrContact] = useState<any>(null);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailPreview, setEmailPreview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && prospectId) {
      loadProspectData();
    }
  }, [isOpen, prospectId]);

  const loadProspectData = async () => {
    try {
      // Fetch the prospect data
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
      
      if (prospect.hr_contacts && prospect.hr_contacts.length > 0) {
        const hrContactData = prospect.hr_contacts[0];
        setHrContact(hrContactData);
        
        // Set default email subject
        const courseName = prospect.product_type || 'Training Program';
        setEmailSubject(`Training Registration for ${courseName}`);
        
        // Generate email preview
        generateEmailPreview(hrContactData.name, prospect.name, courseName, prospect.product_type);
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

  const generateEmailPreview = (hrName: string, staffName: string, courseName: string, productType: string) => {
    // Program-specific links mapping
    const programLinks: Record<string, { signupForm: string; courseBrochure: string }> = {
      "Business Writing with AI: 2-Day Masterclass": {
        signupForm: "https://drive.google.com/file/d/1i8os64_0YWr0nlJns88-i3IT1hNaepaN/view?usp=drive_link",
        courseBrochure: "https://drive.google.com/file/d/1f0-Nyg0zXxJ2-4c4OBzAduQr7Lk9QWmU/view?usp=drive_link"
      },
      "ChatGPT Skill Boost (Intermediate)": {
        signupForm: "https://drive.google.com/file/d/14xHGHHjbpXKo37D0Rp12mPKxJGxfJWP3/view?usp=drive_link",
        courseBrochure: "https://drive.google.com/file/d/16L7LfiuwFIIlJoY8HsMYql9pMSn372LX/view?usp=drive_link"
      },
      "AI and ChatGPT for HR Professionals - 2 Day Masterclass": {
        signupForm: "www.example.com",
        courseBrochure: "https://drive.google.com/file/d/1GWc2tUZfsUR8FSZxuGuBR8T34iVv9fFy/view"
      },
      "The AI-Ready Leader: Win the Future with Strategic Action": {
        signupForm: "www.example.com",
        courseBrochure: "https://drive.google.com/file/d/1silb4DtDCHv04r_eriODS6nn-QWZmkrs/view"
      }
    };

    const links = programLinks[productType] || {
      signupForm: "www.example.com",
      courseBrochure: "www.example.com"
    };

    const preview = `Dear ${hrName},

I hope this message finds you well.

I am writing to facilitate the registration of ${staffName} from your organization for the upcoming training program, ${courseName}, conducted by AIHQ.

Attached are the following documents for your review:

- Course Brochure: ${links.courseBrochure}
- Sign-Up Form: ${links.signupForm}

The fee for this 2-day program is RM2,850, as stated in the sign-up form. Please note that this course is 100% HRDC Claimable. We kindly ask you to review the enclosed materials for HRD levy approval and confirm the registration at your earliest convenience.

For more information on AIHQ's expertise and track record, feel free to explore:

AIHQ's Profile & Portfolio: https://theaihq.net/AIHQ_&_Pang%20-%20Detailed%20Profile__.pdf

Our Website: http://theaihq.net

Our 4.9-Star Google Reviews: [Google Reviews Link]

Should you have any questions or need further assistance, please feel free to contact me directly.

Thank you for your attention and support. We look forward to welcoming ${staffName} to the program.

Best regards,
AIHQ Training and Consultancy

_______`;

    setEmailPreview(preview);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hrContact || !emailSubject.trim() || !prospectData) {
      toast({
        title: "Error",
        description: "Missing required information",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Call the SendGrid edge function with product_type
      const { data, error } = await supabase.functions.invoke('send-hr-notification', {
        body: {
          to_email: hrContact.email,
          to_name: hrContact.name,
          subject: emailSubject,
          message: emailPreview, // This won't be used in the new template system
          prospect_name: prospectData?.name,
          program_title: prospectData?.product_type || 'Training Program',
          product_type: prospectData?.product_type
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
    setHrContact(null);
    setEmailSubject('');
    setEmailPreview('');
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Send HR Notification
          </DialogTitle>
          <DialogDescription>
            Send a professional training registration email to {hrContact.name} ({hrContact.email})
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
              <Label htmlFor="preview">Email Preview</Label>
              <div className="text-sm text-gray-600 mb-2">
                This is a preview of the email that will be sent. The actual email will be formatted with proper HTML styling and clickable links.
              </div>
              <Textarea
                id="preview"
                value={emailPreview}
                readOnly
                className="min-h-[400px] bg-gray-50 font-mono text-sm"
                placeholder="Email preview will appear here"
              />
            </div>

            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-start gap-2">
                <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <div className="font-medium text-blue-900">Email Details</div>
                  <div className="text-sm text-blue-700 mt-1">
                    <div><strong>To:</strong> {hrContact.name} ({hrContact.email})</div>
                    <div><strong>From:</strong> AIHQ Training and Consultancy (wani@theaihq.net)</div>
                    <div><strong>Program:</strong> {prospectData?.product_type}</div>
                    <div><strong>Participant:</strong> {prospectData?.name}</div>
                  </div>
                  {hrContact.email_sent_at && (
                    <div className="mt-2 text-green-600 text-sm">
                      ✅ Previous email sent: {new Date(hrContact.email_sent_at).toLocaleString()}
                    </div>
                  )}
                </div>
              </div>
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
