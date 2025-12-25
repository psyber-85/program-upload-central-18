import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { talentRequestRepo } from '@/lib/placement/client';
import { CheckCircle2, Building2, Users, Clock } from 'lucide-react';

const requestSchema = z.object({
  companyName: z.string().trim().min(2, 'Company name must be at least 2 characters').max(100, 'Company name must be less than 100 characters'),
  contactName: z.string().trim().min(2, 'Contact name must be at least 2 characters').max(100, 'Contact name must be less than 100 characters'),
  contactEmail: z.string().trim().email('Please enter a valid email address').max(255, 'Email must be less than 255 characters'),
  contactPhone: z.string().trim().max(20, 'Phone must be less than 20 characters').optional(),
  roleTitle: z.string().trim().min(2, 'Role title must be at least 2 characters').max(100, 'Role title must be less than 100 characters'),
  roleDescription: z.string().trim().min(20, 'Please provide at least 20 characters describing the role').max(2000, 'Description must be less than 2000 characters'),
  headcount: z.coerce.number().min(1, 'Headcount must be at least 1').max(100, 'Headcount must be less than 100'),
  urgency: z.enum(['ASAP', 'ONE_MONTH', 'THREE_MONTHS', 'EXPLORING']),
  notes: z.string().trim().max(1000, 'Notes must be less than 1000 characters').optional(),
});

type RequestFormData = z.infer<typeof requestSchema>;

export function RequestTalent() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<RequestFormData>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      companyName: '',
      contactName: '',
      contactEmail: '',
      contactPhone: '',
      roleTitle: '',
      roleDescription: '',
      headcount: 1,
      urgency: 'ONE_MONTH',
      notes: '',
    },
  });

  const onSubmit = async (data: RequestFormData) => {
    setIsSubmitting(true);
    try {
      await talentRequestRepo.create({
        companyName: data.companyName,
        contactName: data.contactName,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone,
        roleTitle: data.roleTitle,
        roleDescription: data.roleDescription,
        headcount: data.headcount,
        urgency: data.urgency,
        notes: data.notes,
        status: 'NEW',
      });
      setIsSubmitted(true);
      toast({
        title: 'Request submitted!',
        description: 'We will contact you within 1 business day.',
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to submit request. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="py-20">
        <div className="container mx-auto px-4">
          <Card className="max-w-lg mx-auto text-center">
            <CardContent className="pt-10 pb-10">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <CheckCircle2 className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-4">Request Submitted!</h2>
              <p className="text-muted-foreground mb-6">
                Thank you for your interest. Our team will review your request and 
                contact you within 1 business day.
              </p>
              <Button onClick={() => navigate('/')}>Back to Home</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Request Talent</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Tell us about your hiring needs and we'll match you with qualified candidates.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Role Details</CardTitle>
                <CardDescription>
                  Fill out the form below and we'll be in touch within 1 business day.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="companyName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Company Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="Your Company Pte Ltd" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="contactName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Your Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="John Tan" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="contactEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email *</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="john@company.sg" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="contactPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="+65 9123 4567" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="roleTitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Role Title *</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. AI Engineer, Data Analyst" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="roleDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Role Description *</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe the role, required skills, and responsibilities..."
                              className="min-h-[120px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="headcount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Number of Positions *</FormLabel>
                            <FormControl>
                              <Input type="number" min={1} max={100} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="urgency"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Timeline *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select timeline" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="ASAP">ASAP</SelectItem>
                                <SelectItem value="ONE_MONTH">Within 1 month</SelectItem>
                                <SelectItem value="THREE_MONTHS">Within 3 months</SelectItem>
                                <SelectItem value="EXPLORING">Just exploring</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Additional Notes (Optional)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Any specific requirements or preferences..."
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                      {isSubmitting ? 'Submitting...' : 'Submit Request'}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-4">What Happens Next?</h3>
                <ul className="space-y-4 text-sm">
                  <li className="flex gap-3">
                    <Clock className="h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-muted-foreground">Our team reviews your request within 1 business day</span>
                  </li>
                  <li className="flex gap-3">
                    <Users className="h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-muted-foreground">We match candidates from our trained talent pool</span>
                  </li>
                  <li className="flex gap-3">
                    <Building2 className="h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-muted-foreground">You get access to your employer portal to manage the process</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-primary text-primary-foreground">
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-2">Questions?</h3>
                <p className="text-sm text-primary-foreground/80 mb-4">
                  Our team is here to help with any questions about the placement process.
                </p>
                <Button variant="secondary" size="sm" asChild>
                  <a href="mailto:placement@aihq.sg">Contact Us</a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
