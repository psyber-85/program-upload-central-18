
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Programme {
  id: string;
  name: string;
}

const AddProspectForm = () => {
  const [programmes, setProgrammes] = useState<Programme[]>([]);
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
    fetch('/api/programmes')
      .then(r => r.json())
      .then(setProgrammes)
      .catch(console.error);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.programmeId || !formData.name || !formData.email) {
      toast({
        title: "Missing required fields",
        description: "Please fill in programme, name, and email",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // TODO: fetch('/api/prospects', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(formData) })
      await fetch('/api/prospects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      toast({
        title: "Prospect added",
        description: "New prospect has been added successfully",
      });

      // Reset form
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
        description: "Failed to add prospect",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="w-5 h-5" />
          Add New Prospect
        </CardTitle>
        <CardDescription>
          Add a single prospect to a programme
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="programmeId">Programme *</Label>
              <select
                id="programmeId"
                name="programmeId"
                value={formData.programmeId}
                onChange={handleChange}
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

            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
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
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                name="company"
                value={formData.company}
                onChange={handleChange}
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="jobRole">Job Role</Label>
              <Input
                id="jobRole"
                name="jobRole"
                value={formData.jobRole}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="mt-6">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? 'Adding Prospect...' : 'Add Prospect'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AddProspectForm;
