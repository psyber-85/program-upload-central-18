
import React, { useState, useEffect } from 'react';
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
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Program {
  id: string;
  title: string;
}

interface AddProspectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const AddProspectModal = ({ isOpen, onClose, onComplete }: AddProspectModalProps) => {
  const [programmes, setProgrammes] = useState<Program[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    program_id: '',
    name: '',
    email: '',
    phone: '',
    org: '',
    role: '',
    payment: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchPrograms();
    }
  }, [isOpen]);

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      
      // Fetch programs from registration_programs table
      const { data, error } = await supabase
        .from('registration_programs')
        .select('id, title')
        .order('title', { ascending: true });

      if (error) throw error;
      
      setProgrammes(data || []);
    } catch (error) {
      console.error('Error fetching programs:', error);
      toast({
        title: "Error",
        description: "Failed to load programs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('prospects')
        .insert([{
          program_id: formData.program_id,
          name: formData.name,
          email: formData.email,
          phone: formData.phone || null,
          org: formData.org || null,
          role: formData.role || null,
          payment: formData.payment || null,
          registration_status: 'Pending'
        }]);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Prospect added successfully!",
      });

      // Clear form and close modal
      setFormData({
        program_id: '',
        name: '',
        email: '',
        phone: '',
        org: '',
        role: '',
        payment: ''
      });
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
    setFormData({
      program_id: '',
      name: '',
      email: '',
      phone: '',
      org: '',
      role: '',
      payment: ''
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Prospect</DialogTitle>
          <DialogDescription>
            Add a new prospect to the registration tracker
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="program_id">Programme *</Label>
            <select
              id="program_id"
              name="program_id"
              value={formData.program_id}
              onChange={handleInputChange}
              required
              disabled={loading}
              className="w-full h-10 px-3 py-2 border border-input bg-background rounded-md disabled:opacity-50"
            >
              <option value="">
                {loading ? 'Loading programs...' : 'Select a program...'}
              </option>
              {programmes.map((programme) => (
                <option key={programme.id} value={programme.id}>
                  {programme.title}
                </option>
              ))}
            </select>
          </div>

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

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || loading} className="flex-1">
              {isSubmitting ? 'Adding...' : 'Add Prospect'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddProspectModal;
