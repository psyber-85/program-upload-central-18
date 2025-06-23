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

const AddProspectForm = () => {
  const [programmes, setProgrammes] = useState<Program[]>([]);
  const [formData, setFormData] = useState({
    programmeId: '',
    name: '',
    email: '',
    phone: '',
    company: '',
    jobRole: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      const { data, error } = await supabase
        .from('programs')
        .select('id, title')
        .order('created_at', { ascending: false });

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
      // TODO: Replace with actual Supabase insert when participants table is ready
      console.log('Adding prospect:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Success",
        description: "Prospect added successfully!",
      });

      // Clear form
      setFormData({
        programmeId: '',
        name: '',
        email: '',
        phone: '',
        company: '',
        jobRole: ''
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
            <Label htmlFor="programmeId">Programme</Label>
            <select
              id="programmeId"
              name="programmeId"
              value={formData.programmeId}
              onChange={handleInputChange}
              required
              disabled={loading}
              className="w-full h-10 px-3 py-2 border border-input bg-background rounded-md disabled:opacity-50"
            >
              <option value="">
                {loading ? 'Loading programs...' : 'Select a programme...'}
              </option>
              {programmes.map((programme) => (
                <option key={programme.id} value={programme.id}>
                  {programme.title}
                </option>
              ))}
            </select>
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
              required
            />
          </div>

          <div>
            <Label htmlFor="company">Company</Label>
            <Input
              id="company"
              name="company"
              value={formData.company}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="jobRole">Job Role</Label>
            <Input
              id="jobRole"
              name="jobRole"
              value={formData.jobRole}
              onChange={handleInputChange}
              required
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
