import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { AI_SKILL_LEVELS, AISkillLevel, RoleRequestTimeline } from '@/lib/placement/types';

const roleRequestSchema = z.object({
  title: z.string().min(3, 'Role title must be at least 3 characters').max(100),
  department: z.string().min(2, 'Department is required').max(50),
  problem_statement: z
    .string()
    .min(20, 'Please provide more detail about the problem (at least 20 characters)')
    .max(1000),
  ai_skill_level: z.enum(['L1', 'L2', 'L3', 'L4'] as const),
  timeline: z.enum(['urgent', 'normal', 'flexible'] as const),
  notes: z.string().max(500).optional(),
});

type RoleRequestFormData = z.infer<typeof roleRequestSchema>;

const timelineOptions: { value: RoleRequestTimeline; label: string; description: string }[] = [
  { value: 'urgent', label: 'Urgent', description: 'Need to fill within 2 weeks' },
  { value: 'normal', label: 'Normal', description: 'Standard 4-6 week timeline' },
  { value: 'flexible', label: 'Flexible', description: 'No specific deadline' },
];

export function NewRoleRequest() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<RoleRequestFormData>({
    resolver: zodResolver(roleRequestSchema),
    defaultValues: {
      title: '',
      department: '',
      problem_statement: '',
      ai_skill_level: 'L2',
      timeline: 'normal',
      notes: '',
    },
  });

  const onSubmit = async (data: RoleRequestFormData) => {
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    console.log('Role request submitted:', data);
    setIsSubmitting(false);
    setIsSubmitted(true);
    
    toast({
      title: 'Role request submitted',
      description: 'AIHQ will review your request and propose curated candidates.',
    });
  };

  if (isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="py-12 text-center">
            <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Role Request Submitted</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Thank you for submitting your role request. AIHQ will review your requirements and propose curated candidates within 3-5 business days.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={() => navigate('/employer/roles')}>
                View All Roles
              </Button>
              <Button variant="outline" onClick={() => {
                setIsSubmitted(false);
                form.reset();
              }}>
                Submit Another
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold text-foreground">New Role Request</h1>
        <p className="text-muted-foreground">
          Tell us about the AI talent you need
        </p>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Role Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Role Title */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. AI Operations Specialist" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Department */}
              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Operations, Marketing, IT" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Problem Statement */}
              <FormField
                control={form.control}
                name="problem_statement"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>What problem are you hiring to solve?</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the business challenge or opportunity this role will address..."
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Help us understand your needs so we can find the best-fit candidates
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* AI Skill Level */}
              <FormField
                control={form.control}
                name="ai_skill_level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Required AI Skill Level</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select skill level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(Object.keys(AI_SKILL_LEVELS) as AISkillLevel[]).map((level) => (
                          <SelectItem key={level} value={level}>
                            <span className="font-medium">{level}</span>
                            <span className="text-muted-foreground ml-2">
                              - {AI_SKILL_LEVELS[level].label}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      {AI_SKILL_LEVELS[field.value as AISkillLevel].description}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Timeline */}
              <FormField
                control={form.control}
                name="timeline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hiring Timeline</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select timeline" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {timelineOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <span className="font-medium">{option.label}</span>
                            <span className="text-muted-foreground ml-2">
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

              {/* Additional Notes */}
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Any other requirements or preferences..."
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Callout */}
              <Callout variant="info" title="What happens next?">
                AIHQ will review your request and propose 2-5 curated candidates within 3-5 business days. You'll receive an email notification when candidates are ready for your review.
              </Callout>

              {/* Submit */}
              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={isSubmitting} className="flex-1">
                  {isSubmitting ? 'Submitting...' : 'Submit Role Request'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(-1)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Grant Info */}
      <Callout variant="trust">
        This placement may be eligible for grant-backed training schemes, subject to approval. AIHQ will advise on available options.
      </Callout>
    </div>
  );
}
