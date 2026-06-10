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
  const [pricing, setPricing] = useState<string>('');
  const [signupFormUrl, setSignupFormUrl] = useState('');
  const [brochureUrl, setBrochureUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { activeRoundId, refreshPrograms } = useRegistration();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!programTitle.trim()) {
      toast({ title: 'Error', description: 'Program title cannot be empty', variant: 'destructive' });
      return;
    }
    if (!activeRoundId) {
      toast({ title: 'Error', description: 'Please select a registration round first', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);

    try {
      const title = programTitle.trim();
      const pricingNum = pricing.trim() ? Number(pricing) : null;
      if (pricing.trim() && (pricingNum === null || isNaN(pricingNum))) {
        throw new Error('Pricing must be a number');
      }

      const { error: progErr } = await supabase
        .from('registration_programs')
        .insert([{ title, round_id: activeRoundId, pricing: pricingNum }]);
      if (progErr) throw progErr;

      // Upsert program_links if any URL provided
      if (signupFormUrl.trim() || brochureUrl.trim()) {
        const { error: linkErr } = await supabase
          .from('program_links')
          .upsert(
            {
              program_title: title,
              signup_form_url: signupFormUrl.trim() || '',
              brochure_url: brochureUrl.trim() || '',
            },
            { onConflict: 'program_title' },
          );
        if (linkErr) throw linkErr;
      }

      toast({ title: 'Success', description: 'Program added successfully!' });

      setProgramTitle('');
      setPricing('');
      setSignupFormUrl('');
      setBrochureUrl('');
      await refreshPrograms();
      onProgramAdded?.();
    } catch (error: any) {
      console.error('Error adding program:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to add program. Please try again.',
        variant: 'destructive',
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
      <div>
        <Label htmlFor="pricing">Pricing (RM)</Label>
        <Input
          id="pricing"
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
        <Label htmlFor="signupFormUrl">Sign-Up Form URL</Label>
        <Input
          id="signupFormUrl"
          type="url"
          value={signupFormUrl}
          onChange={(e) => setSignupFormUrl(e.target.value)}
          placeholder="https://drive.google.com/..."
          className="mt-1"
        />
      </div>
      <div>
        <Label htmlFor="brochureUrl">Course Brochure URL</Label>
        <Input
          id="brochureUrl"
          type="url"
          value={brochureUrl}
          onChange={(e) => setBrochureUrl(e.target.value)}
          placeholder="https://drive.google.com/..."
          className="mt-1"
        />
      </div>
      <Button type="submit" disabled={isSubmitting || !programTitle.trim()} className="w-full">
        {isSubmitting ? 'Adding Program...' : 'Add Program'}
      </Button>
    </form>
  );
};

export default AddProgramForm;
