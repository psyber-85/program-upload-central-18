
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

// Mock programmes data
const mockProgrammes = [
  { id: '1', name: 'Business Writing with AI Masterclass' },
  { id: '2', name: 'ChatGPT Skill Boost Masterclass' },
  { id: '3', name: 'Digital Leadership Programme' },
  { id: '4', name: 'AI Tools for Productivity' }
];

const AddProspectForm = () => {
  const [programmes, setProgrammes] = useState<Array<{id: string, name: string}>>([]);
  const [formData, setFormData] = useState({
    programmeId: '',
    name: '',
    email: '',
    phone: '',
    company: '',
    jobRole: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // TODO: fetch('/api/programmes')
    // Using mock data for now
    setProgrammes(mockProgrammes);
  }, []);

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
      // TODO: fetch('/api/prospects', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(formData) })
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
              className="w-full h-10 px-3 py-2 border border-input bg-background rounded-md"
            >
              <option value="">Select a programme...</option>
              {programmes.map((programme) => (
                <option key={programme.id} value={programme.id}>
                  {programme.name}
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
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? 'Adding Prospect...' : 'Add Prospect'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AddProspectForm;
