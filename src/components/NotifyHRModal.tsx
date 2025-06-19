import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Mail } from 'lucide-react';

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

Regards, [Your Company]`
  },
  "ChatGPT Skill Boost Masterclass": {
    subject: "Invitation: ChatGPT Skill Boost Masterclass",
    body: `Dear [HR Name],

[Prospect Name] expressed interest in our "ChatGPT Skill Boost Masterclass." Attached is the sign-up form. Let us know how you'd like to proceed.

Best, [Your Team]`
  },
  default: {
    subject: "Programme Sign-Up Form",
    body: `Dear [HR Name],

We recently spoke with [Prospect Name] about our programme. Attached is the sign-up form. Please confirm if you'd like to proceed.

Best regards, [Your Company]`
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && prospectId) {
      // TODO: Load programme-specific template
      // fetch(`/api/programmes/${prospectId}/email-template`)
      //   .then(r => r.json())
      //   .then(template => setFormData(template))
      
      // For now, use default template
      const template = templates.default;
      setFormData(template);
    }
  }, [isOpen, prospectId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const emailData = {
        ...formData,
        attachmentUrl: 'https://yourdomain.com/forms/signup-form.pdf'
      };

      // TODO: fetch(`/api/prospects/${prospectId}/email`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(emailData) })
      await fetch(`/api/prospects/${prospectId}/email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(emailData)
      });

      onComplete();
      onClose();
    } catch (error) {
      console.error('Failed to send email:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Notify HR
          </DialogTitle>
          <DialogDescription>
            Send programme-specific email with sign-up form attachment
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
            <Button type="button" variant="outline" onClick={onClose}>
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
