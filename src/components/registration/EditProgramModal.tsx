import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useRegistration } from '@/lib/registration/RegistrationContext';
import { RegistrationProgram } from '@/lib/registration/types';

interface EditProgramModalProps {
  isOpen: boolean;
  onClose: () => void;
  program: RegistrationProgram;
}

const EditProgramModal: React.FC<EditProgramModalProps> = ({ isOpen, onClose, program }) => {
  const { toast } = useToast();
  const { refreshPrograms } = useRegistration();

  const [title, setTitle] = useState(program.title);
  const [pricing, setPricing] = useState<string>(program.pricing != null ? String(program.pricing) : '');
  const [signupFormUrl, setSignupFormUrl] = useState('');
  const [brochureUrl, setBrochureUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setTitle(program.title);
    setPricing(program.pricing != null ? String(program.pricing) : '');
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from('program_links')
        .select('signup_form_url, brochure_url')
        .eq('program_title', program.title)
        .maybeSingle();
      setSignupFormUrl(data?.signup_form_url || '');
      setBrochureUrl(data?.brochure_url || '');
      setLoading(false);
    })();
  }, [isOpen, program.id, program.title, program.pricing]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const newTitle = title.trim();
    if (!newTitle) {
      toast({ title: 'Error', description: 'Title cannot be empty', variant: 'destructive' });
      return;
    }
    const pricingNum = pricing.trim() ? Number(pricing) : null;
    if (pricing.trim() && (pricingNum === null || isNaN(pricingNum))) {
      toast({ title: 'Error', description: 'Pricing must be a number', variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      const { error: progErr } = await supabase
        .from('registration_programs')
        .update({ title: newTitle, pricing: pricingNum })
        .eq('id', program.id);
      if (progErr) throw progErr;

      const hasUrls = signupFormUrl.trim() || brochureUrl.trim();
      if (hasUrls) {
        const { error: upErr } = await supabase
          .from('program_links')
          .upsert(
            {
              program_title: newTitle,
              signup_form_url: signupFormUrl.trim() || '',
              brochure_url: brochureUrl.trim() || '',
            },
            { onConflict: 'program_title' },
          );
        if (upErr) throw upErr;
      }

      // Remove old title row if title changed
      if (newTitle !== program.title) {
        await supabase.from('program_links').delete().eq('program_title', program.title);
      }

      toast({ title: 'Saved', description: 'Program updated successfully' });
      await refreshPrograms();
      onClose();
    } catch (error: any) {
      console.error('Error saving program:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save program',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Program</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <Label htmlFor="edit-title">Program Title</Label>
            <Input
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Renaming will move the brochure/signup links to the new title.
            </p>
          </div>
          <div>
            <Label htmlFor="edit-pricing">Pricing (RM)</Label>
            <Input
              id="edit-pricing"
              type="number"
              min="0"
              step="1"
              value={pricing}
              onChange={(e) => setPricing(e.target.value)}
              placeholder="e.g. 2850"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="edit-signup">Sign-Up Form URL</Label>
            <Input
              id="edit-signup"
              type="url"
              value={signupFormUrl}
              onChange={(e) => setSignupFormUrl(e.target.value)}
              placeholder="https://drive.google.com/..."
              className="mt-1"
              disabled={loading}
            />
          </div>
          <div>
            <Label htmlFor="edit-brochure">Course Brochure URL</Label>
            <Input
              id="edit-brochure"
              type="url"
              value={brochureUrl}
              onChange={(e) => setBrochureUrl(e.target.value)}
              placeholder="https://drive.google.com/..."
              className="mt-1"
              disabled={loading}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving || loading}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditProgramModal;
