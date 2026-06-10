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
  const [hrEmail, setHrEmail] = useState('');
  const [programName, setProgramName] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailPreview, setEmailPreview] = useState('');
  const [pricing, setPricing] = useState<number>(2850);
  const [linksMissing, setLinksMissing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [programLinks, setProgramLinks] = useState<Record<string, { signupForm: string; courseBrochure: string }>>({});
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && prospectId) {
      loadProgramLinks();
      loadProspectData();
    }
  }, [isOpen, prospectId]);

  // Regenerate email preview when program links, prospect, hr contact, or program name changes
  useEffect(() => {
    if (Object.keys(programLinks).length > 0 && prospectData && hrContact && programName) {
      generateEmailPreview(
        hrContact.name,
        prospectData.name,
        programName,
        programName,
        prospectData.pricing,
      );
    }
  }, [programLinks, prospectData, hrContact, programName]);

  const loadProgramLinks = async () => {
    try {
      const { data, error } = await supabase
        .from('program_links')
        .select('program_title, signup_form_url, brochure_url');

      if (error) throw error;

      if (data) {
        const linksMap = data.reduce((acc, item) => {
          acc[item.program_title] = {
            signupForm: item.signup_form_url,
            courseBrochure: item.brochure_url
          };
          return acc;
        }, {} as Record<string, { signupForm: string; courseBrochure: string }>);
        
        setProgramLinks(linksMap);
        console.log('Loaded program links from database:', Object.keys(linksMap));
      }
    } catch (error) {
      console.error('Failed to load program links:', error);
      // Graceful fallback - will use placeholder links
    }
  };

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

      // Fetch program title and pricing from registration_programs using program_id
      let programTitle = 'Training Program';
      let programPricing = 2850; // Default
      
      if (prospect.program_id) {
        const { data: program } = await supabase
          .from('registration_programs')
          .select('title, pricing')
          .eq('id', prospect.program_id)
          .single();
        
        if (program) {
          programTitle = program.title;
          if (program.pricing) {
            programPricing = program.pricing;
          }
        }
      }

      console.log('Prospect data loaded:', { 
        programTitle, 
        programId: prospect.program_id,
        pricing: programPricing
      });

      const prospectWithProgram = { ...prospect, programTitle, pricing: programPricing };
      setProspectData(prospectWithProgram);
      setPricing(programPricing);
      setProgramName(programTitle);

      if (prospect.hr_contacts && prospect.hr_contacts.length > 0) {
        const hrContactData = prospect.hr_contacts[0];
        setHrContact(hrContactData);
        setHrEmail(hrContactData.email || '');
        setEmailSubject(`Training Registration for ${programTitle}`);
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

  const generateEmailPreview = (hrName: string, staffName: string, courseName: string, programKey: string, programPricing: number) => {
    console.log('Generating email preview for program:', programKey);
    
    // Try exact match first
    let links = programLinks[programKey];
    
    if (!links) {
      // Try to find partial matches for flexibility
      const programKeys = Object.keys(programLinks);
      const matchedKey = programKeys.find(key => 
        key.toLowerCase().includes(programKey.toLowerCase()) || 
        programKey.toLowerCase().includes(key.toLowerCase().replace(/[^\w\s]/g, '').trim())
      );
      
      if (matchedKey) {
        links = programLinks[matchedKey];
        console.log(`Found partial match: ${matchedKey} for ${programKey}`);
      }
    }

    if (!links) {
      console.error('No links found for program:', programKey);
      console.log('Available program keys:', Object.keys(programLinks));
      // Use placeholder links that clearly indicate the issue
      links = {
        signupForm: "https://drive.google.com/file/d/[SIGN_UP_FORM_NOT_FOUND]",
        courseBrochure: "https://drive.google.com/file/d/[COURSE_BROCHURE_NOT_FOUND]"
      };
      setLinksMissing(true);
    } else {
      console.log('Found links for program:', programKey, links);
      setLinksMissing(false);
    }

    const preview = `Dear ${hrName},

I hope this message finds you well.

I am writing to facilitate the registration of ${staffName} from your organization for the upcoming training program, ${courseName}, conducted by AIHQ.

Attached are the following documents for your review:

- Course Brochure: ${links.courseBrochure}
- Sign-Up Form: ${links.signupForm}

The fee for this 2-day program is RM${programPricing}, as stated in the sign-up form. However, this course is 100% HRDC Claimable. We kindly ask you to review the enclosed materials for HRD levy approval and confirm the registration at your earliest convenience.

For more information on AIHQ's expertise and track record, feel free to explore:

    📌 AIHQ's Profile & Portfolio (http://storage.theaihq.net/AIHQ_Profile.pdf)
    🌍 Our Website - http://theaihq.net
    ⭐ Our 4.9-Star Google Reviews - https://www.google.com/maps?q=AIHQ+Training+and+Consultancy

Should you have any questions or need further assistance, please feel free to contact me directly.

Thank you for your attention and support. We look forward to welcoming ${staffName} to the program.

Warm regards,
Zarnaaz
Training Support Specialist
AIHQ Training & Consultancy
Phone: 011-6184-8751

_______`;

    setEmailPreview(preview);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hrContact || !emailSubject.trim() || !prospectData || !hrEmail.trim()) {
      toast({
        title: "Error",
        description: "Missing required information",
        variant: "destructive",
      });
      return;
    }
    if (linksMissing) {
      toast({
        title: "Cannot send",
        description: "Brochure and Sign-Up links are missing for this program. Add them in Registration Tracker → Edit Program, or adjust the Program Name to match an existing entry.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('Sending email with data:', {
        to_email: hrEmail,
        to_name: hrContact.name,
        participant_email: prospectData.email,
        prospect_name: prospectData?.name,
        program_title: prospectData?.programTitle
      });

      // Call the SendGrid edge function with program title
      const { data, error } = await supabase.functions.invoke('send-hr-notification', {
        body: {
          to_email: hrEmail,
          to_name: hrContact.name,
          participant_email: prospectData.email,
          subject: emailSubject,
          message: emailPreview,
          prospect_name: prospectData?.name,
          program_title: programName || prospectData?.programTitle || 'Training Program',
          product_type: programName || prospectData?.programTitle
        }
      });

      console.log('Edge function response:', { data, error });

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
      }

      toast({
        title: "Success",
        description: `Email sent successfully to HR, participant, and CC'd to AIHQ`,
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
    setHrEmail('');
    setProgramName('');
    setEmailSubject('');
    setEmailPreview('');
    setPricing(2850);
    setLinksMissing(false);
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
            Send a professional training registration email to multiple recipients
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="hrEmail">Send to HR Email</Label>
              <Input
                id="hrEmail"
                type="email"
                value={hrEmail}
                onChange={(e) => setHrEmail(e.target.value)}
                required
                placeholder="hr@company.com"
              />
              <p className="text-xs text-muted-foreground">
                Default: {hrContact.email}. Edit if this HR uses a different address.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="programName">Program Name</Label>
              <Input
                id="programName"
                value={programName}
                onChange={(e) => setProgramName(e.target.value)}
                required
                placeholder="e.g. AI for Business Operations"
              />
              <p className="text-xs text-muted-foreground">
                Used to look up the brochure and sign-up form links, and shown in the email body.
              </p>
            </div>

            {linksMissing && (
              <div className="p-3 rounded-md border border-red-300 bg-red-50 text-sm text-red-800">
                <div className="font-medium">Brochure / Sign-Up links missing for this program.</div>
                <div className="mt-1">
                  Add them in Registration Tracker → Edit Program, or adjust the Program Name above to match an existing entry. Send is disabled until links are resolved.
                </div>
              </div>
            )}

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
                  <div className="font-medium text-blue-900">Email Recipients</div>
                  <div className="text-sm text-blue-700 mt-1">
                    <div><strong>To:</strong> {hrContact.name} ({hrEmail || hrContact.email})</div>
                    <div><strong>To:</strong> {prospectData?.name} ({prospectData?.email})</div>
                    <div><strong>CC:</strong> AIHQ Training and Consultancy (zarnaaz@theaihq.net)</div>
                    <div><strong>From:</strong> Zarnaaz - AIHQ Training and Consultancy (zarnaaz@theaihq.net)</div>
                    <div><strong>Program:</strong> {prospectData?.programTitle}</div>
                    <div><strong>Pricing:</strong> RM{pricing}</div>
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
