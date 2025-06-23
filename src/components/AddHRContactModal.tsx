
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface AddHRContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  prospectId: string;
  onComplete: () => void;
}

const AddHRContactModal: React.FC<AddHRContactModalProps> = ({
  isOpen,
  onClose,
  prospectId,
  onComplete
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingHRId, setExistingHRId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && prospectId) {
      loadExistingHRContact();
    }
  }, [isOpen, prospectId]);

  const loadExistingHRContact = async () => {
    try {
      const { data, error } = await supabase
        .from('hr_contacts')
        .select('*')
        .eq('prospect_id', prospectId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setFormData({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || ''
        });
        setExistingHRId(data.id);
      }
    } catch (error) {
      console.error('Failed to load HR contact:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prospectId) return;
    
    setIsSubmitting(true);

    try {
      if (existingHRId) {
        // Update existing HR contact
        const { error } = await supabase
          .from('hr_contacts')
          .update({
            name: formData.name,
            email: formData.email,
            phone: formData.phone || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingHRId);

        if (error) throw error;
      } else {
        // Create new HR contact
        const { error } = await supabase
          .from('hr_contacts')
          .insert([
            {
              prospect_id: prospectId,
              name: formData.name,
              email: formData.email,
              phone: formData.phone || null
            }
          ]);

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: `HR contact ${existingHRId ? 'updated' : 'added'} successfully`,
      });

      onComplete();
      handleClose();
    } catch (error) {
      console.error('Failed to save HR contact:', error);
      toast({
        title: "Error",
        description: "Failed to save HR contact. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({ name: '', email: '', phone: '' });
    setExistingHRId(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            {existingHRId ? 'Edit HR Contact' : 'Add HR Contact'}
          </DialogTitle>
          <DialogDescription>
            {existingHRId ? 'Update' : 'Add'} HR contact information for this prospect
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">HR Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">HR Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">HR Phone (Optional)</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : existingHRId ? 'Update HR Contact' : 'Add HR Contact'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddHRContactModal;
