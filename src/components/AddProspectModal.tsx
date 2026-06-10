
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AddProspectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  programId: string;
}

type Mode = 'manual' | 'json';

const EMPTY = {
  name: '',
  email: '',
  phone: '',
  org: '',
  role: '',
  payment: '',
  prospect_score: 'C',
};

const JSON_PLACEHOLDER = `{
  "name": "Jane Tan",
  "email": "jane@acme.com",
  "phone": "012-3456789",
  "org": "Acme Sdn Bhd",
  "role": "HR Manager",
  "payment": "hrdc",
  "prospect_score": "B"
}`;

const ALLOWED_SCORES = new Set(['A', 'B', 'C', 'D', 'E']);
const ALLOWED_KEYS = new Set(Object.keys(EMPTY));

const AddProspectModal = ({ isOpen, onClose, onComplete, programId }: AddProspectModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mode, setMode] = useState<Mode>('manual');
  const [jsonText, setJsonText] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [formData, setFormData] = useState({ ...EMPTY });
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const applyJson = () => {
    setJsonError(null);
    let parsed: any;
    try {
      parsed = JSON.parse(jsonText);
    } catch (err: any) {
      setJsonError(`Invalid JSON: ${err.message}`);
      return;
    }
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      setJsonError('JSON must be an object.');
      return;
    }

    // Add-only: do not replace existing non-empty values.
    let appliedCount = 0;
    const ignored: string[] = [];
    setFormData(prev => {
      const next = { ...prev };
      for (const [k, vRaw] of Object.entries(parsed)) {
        if (!ALLOWED_KEYS.has(k)) {
          ignored.push(k);
          continue;
        }
        if (vRaw === null || vRaw === undefined) continue;
        const v = String(vRaw).trim();
        if (!v) continue;

        if (k === 'prospect_score') {
          const up = v.toUpperCase();
          if (!ALLOWED_SCORES.has(up)) continue;
          if (next.prospect_score && next.prospect_score !== 'C') continue; // keep user-set; only overwrite default
          next.prospect_score = up;
          appliedCount++;
          continue;
        }

        // For text fields: only fill when currently empty.
        if (!next[k as keyof typeof next]) {
          (next as any)[k] = v;
          appliedCount++;
        }
      }
      return next;
    });

    if (ignored.length > 0) console.log('AddProspectModal JSON: ignored unknown keys', ignored);
    toast({
      title: 'JSON applied',
      description: `${appliedCount} field${appliedCount === 1 ? '' : 's'} populated. Review before submit.`,
    });
    setJsonText('');
    setMode('manual');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('prospects')
        .insert([{
          program_id: programId,
          name: formData.name,
          email: formData.email,
          phone: formData.phone || null,
          org: formData.org || null,
          role: formData.role || null,
          payment: formData.payment || null,
          prospect_score: formData.prospect_score,
          registration_status: 'Pending'
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Prospect added successfully!",
      });

      setFormData({ ...EMPTY });
      onComplete();
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add prospect. Please try again.",
        variant: "destructive",
      });
      console.error('Failed to add prospect:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({ ...EMPTY });
    setJsonText('');
    setJsonError(null);
    setMode('manual');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Prospect</DialogTitle>
          <DialogDescription>
            Add a new prospect to this program
          </DialogDescription>
        </DialogHeader>

        <div className="inline-flex rounded-md border border-input p-0.5 w-fit">
          <button
            type="button"
            onClick={() => setMode('manual')}
            className={`px-3 py-1 text-xs rounded-sm transition ${
              mode === 'manual' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
            }`}
          >
            Manual
          </button>
          <button
            type="button"
            onClick={() => setMode('json')}
            className={`px-3 py-1 text-xs rounded-sm transition ${
              mode === 'json' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
            }`}
          >
            JSON
          </button>
        </div>

        {mode === 'json' ? (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">
              Paste a JSON object with any of these keys. Only empty fields get filled — existing values are kept.
            </p>
            <Textarea
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              placeholder={JSON_PLACEHOLDER}
              className="font-mono text-xs min-h-[200px]"
            />
            {jsonError && (
              <p className="text-xs text-destructive">{jsonError}</p>
            )}
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setMode('manual')} className="flex-1">
                Back to Manual
              </Button>
              <Button type="button" onClick={applyJson} disabled={!jsonText.trim()} className="flex-1">
                Apply
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>

            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <Label htmlFor="org">Organization</Label>
              <Input
                id="org"
                name="org"
                value={formData.org}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <Label htmlFor="role">Job Role</Label>
              <Input
                id="role"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <Label htmlFor="payment">Payment Type</Label>
              <select
                id="payment"
                name="payment"
                value={formData.payment}
                onChange={handleInputChange}
                className="w-full h-10 px-3 py-2 border border-input bg-background rounded-md"
              >
                <option value="">Select payment type...</option>
                <option value="hrdc">HRDC</option>
                <option value="individual">Individual</option>
              </select>
            </div>

            <div>
              <Label htmlFor="prospect_score">Prospect Score</Label>
              <select
                id="prospect_score"
                name="prospect_score"
                value={formData.prospect_score}
                onChange={handleInputChange}
                className="w-full h-10 px-3 py-2 border border-input bg-background rounded-md"
              >
                <option value="A">A - Highest Priority</option>
                <option value="B">B - High Priority</option>
                <option value="C">C - Medium Priority</option>
                <option value="D">D - Low Priority</option>
                <option value="E">E - Lowest Priority</option>
              </select>
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? 'Adding...' : 'Add Prospect'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AddProspectModal;
