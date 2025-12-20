import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Callout } from '@/components/placement/ui';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, Send } from 'lucide-react';

const requestSchema = z.object({
  companyName: z.string().min(1, 'Company name is required').max(100),
  contactName: z.string().min(1, 'Contact name is required').max(100),
  contactEmail: z.string().email('Please enter a valid email address').max(255),
  contactPhone: z.string().max(20).optional(),
  roleTitle: z.string().min(1, 'Role title is required').max(100),
  department: z.string().min(1, 'Department is required').max(100),
  problemStatement: z.string().min(10, 'Please describe the problem in at least 10 characters').max(1000),
  aiSkillLevel: z.enum(['L1', 'L2', 'L3', 'L4'], { required_error: 'Please select an AI skill level' }),
  timeline: z.enum(['urgent', 'normal', 'flexible'], { required_error: 'Please select a timeline' }),
  additionalNotes: z.string().max(1000).optional(),
});

type RequestFormData = z.infer<typeof requestSchema>;

const aiSkillLevels = [
  { value: 'L1', label: 'L1 - AI Aware', description: 'Basic AI understanding, simple tool usage' },
  { value: 'L2', label: 'L2 - AI User', description: 'Daily AI tool usage, prompt engineering' },
  { value: 'L3', label: 'L3 - AI Builder', description: 'Builds/customizes AI solutions' },
  { value: 'L4', label: 'L4 - AI Architect', description: 'AI strategy, systems design, leadership' },
];

const timelineOptions = [
  { value: 'urgent', label: 'Urgent', description: 'Within 2-4 weeks' },
  { value: 'normal', label: 'Normal', description: 'Within 1-2 months' },
  { value: 'flexible', label: 'Flexible', description: 'No specific deadline' },
];

export function RequestTalent() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<RequestFormData>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      companyName: '',
      contactName: '',
      contactEmail: '',
      contactPhone: '',
      roleTitle: '',
      department: '',
      problemStatement: '',
      additionalNotes: '',
    },
  });

  const onSubmit = async (data: RequestFormData) => {
    // Mock submission - in real app, this would call an API
    console.log('Role request submitted:', data);
    
    toast({
      title: 'Request Submitted',
      description: 'Thank you! Our team will review your request and be in touch shortly.',
    });
    
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="flex flex-col min-h-[60vh]">
        <section className="py-20 lg:py-32 bg-background flex-1 flex items-center">
          <div className="container mx-auto px-4">
            <div className="max-w-lg mx-auto text-center">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-4">
                Request Submitted Successfully
              </h1>
              <p className="text-muted-foreground mb-8">
                Thank you for your role request. Our team will review the details and 
                contact you within 2 business days to discuss next steps.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild>
                  <Link to="/">Return to Home</Link>
                </Button>
                <Button variant="outline" onClick={() => setIsSubmitted(false)}>
                  Submit Another Request
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-muted/50 to-background py-12 lg:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-foreground mb-4">
              Request AI Talent
            </h1>
            <p className="text-lg text-muted-foreground">
              Tell us about your hiring needs. AIHQ will review your request and 
              present curated candidates matched to your requirements.
            </p>
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-12 lg:py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Role Request Form</CardTitle>
                <CardDescription>
                  All fields marked with * are required
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Company Information */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-foreground border-b border-border pb-2">
                        Company Information
                      </h3>
                      
                      <FormField
                        control={form.control}
                        name="companyName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Company Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="Your company name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid sm:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="contactName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Contact Name *</FormLabel>
                              <FormControl>
                                <Input placeholder="Your name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="contactEmail"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Contact Email *</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="you@company.com" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="contactPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contact Phone</FormLabel>
                            <FormControl>
                              <Input placeholder="+65 9XXX XXXX" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Role Details */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-foreground border-b border-border pb-2">
                        Role Details
                      </h3>
                      
                      <div className="grid sm:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="roleTitle"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Role Title *</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., AI Solutions Analyst" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="department"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Department *</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., Operations, IT, Marketing" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="problemStatement"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>What problem are you hiring to solve? *</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Describe the challenges you want this role to address and what success looks like..."
                                className="min-h-[120px]"
                                {...field} 
                              />
                            </FormControl>
                            <FormDescription>
                              Help us understand your needs so we can find the right candidates.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Requirements */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-foreground border-b border-border pb-2">
                        Requirements
                      </h3>
                      
                      <FormField
                        control={form.control}
                        name="aiSkillLevel"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>AI Skill Level *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select required AI skill level" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {aiSkillLevels.map((level) => (
                                  <SelectItem key={level.value} value={level.value}>
                                    <div>
                                      <span className="font-medium">{level.label}</span>
                                      <span className="text-muted-foreground ml-2 text-sm">
                                        - {level.description}
                                      </span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              <Link to="/ai-skill-framework" className="text-primary hover:underline">
                                Learn about AI skill levels →
                              </Link>
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="timeline"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Hiring Timeline *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="When do you need to fill this role?" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {timelineOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    <span className="font-medium">{option.label}</span>
                                    <span className="text-muted-foreground ml-2 text-sm">
                                      - {option.description}
                                    </span>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="additionalNotes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Additional Notes</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Any other information that would help us find the right candidates..."
                                className="min-h-[80px]"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Grant Callout */}
                    <Callout variant="info">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium mb-1">Grant Eligibility</p>
                          <p className="text-sm text-muted-foreground">
                            Eligible employers may access government-supported training schemes. 
                            AIHQ will assess eligibility and guide you through the application 
                            process if applicable.
                          </p>
                        </div>
                      </div>
                    </Callout>

                    {/* Submit Button */}
                    <Button type="submit" size="lg" className="w-full">
                      <Send className="mr-2 h-4 w-4" />
                      Submit Role Request
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
