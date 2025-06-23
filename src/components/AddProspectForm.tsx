
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Program {
  id: string;
  title: string;
}

// Define the 4 masterclasses that should be available
const MASTERCLASSES = [
  'Business Writing with AI: 2-Day Masterclass',
  'The AI-Ready Leader: Win the Future with Strategic Action',
  'ChatGPT Skill Boost (Intermediate)',
  'AI and ChatGPT for HR Professionals - 2 Day Masterclass'
];

const AddProspectForm = () => {
  const [programmes, setProgrammes] = useState<Program[]>([]);
  const [formData, setFormData] = useState({
    program_id: '',
    name: '',
    email: '',
    phone: '',
    org: '',
    role: '',
    payment_status: '',
    product_type: '',
    registration_status: 'Pending' as const
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      // First, ensure all masterclasses exist in the database
      for (const masterclass of MASTERCLASSES) {
        const { data: existingProgram, error: fetchError } = await supabase
          .from('programs')
          .select('id')
          .eq('title', masterclass)
          .single();

        if (fetchError && fetchError.code === 'PGRST116') {
          // Program doesn't exist, create it
          const { error: createError } = await supabase
            .from('programs')
            .insert([{ title: masterclass }]);

          if (createError) {
            console.error('Error creating program:', createError);
          }
        }
      }

      // Now fetch only the masterclasses
      const { data, error } = await supabase
        .from('programs')
        .select('id, title')
        .in('title', MASTERCLASSES)
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
          payment_status: formData.payment_status || null,
          product_type: formData.product_type || null,
          registration_status: formData.registration_status
        }]);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Prospect added successfully!",
      });

      // Clear form
      setFormData({
        program_id: '',
        name: '',
        email: '',
        phone: '',
        org: '',
        role: '',
        payment_status: '',
        product_type: '',
        registration_status: 'Pending'
      });
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Prospect</CardTitle>
        <CardDescription>Add a new prospect to the registration tracker</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Label htmlFor="program_id">Programme</Label>
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
                {loading ? 'Loading masterclasses...' : 'Select a masterclass...'}
              </option>
              {programmes.map((programme) => (
                <option key={programme.id} value={programme.id}>
                  {programme.title}
                </option>
              ))}
            </select>
            {programmes.length === 0 && !loading && (
              <p className="text-sm text-gray-500 mt-1">
                Only the 4 core masterclasses are available for prospect registration.
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
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
            <Label htmlFor="payment_status">Payment Status</Label>
            <select
              id="payment_status"
              name="payment_status"
              value={formData.payment_status}
              onChange={handleInputChange}
              className="w-full h-10 px-3 py-2 border border-input bg-background rounded-md"
            >
              <option value="">Select payment status...</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          <div>
            <Label htmlFor="product_type">Product Type</Label>
            <Input
              id="product_type"
              name="product_type"
              value={formData.product_type}
              onChange={handleInputChange}
              placeholder="e.g., masterclass, workshop"
            />
          </div>

          <div className="md:col-span-2">
            <Button type="submit" disabled={isSubmitting || loading} className="w-full">
              {isSubmitting ? 'Adding Prospect...' : 'Add Prospect'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AddProspectForm;
