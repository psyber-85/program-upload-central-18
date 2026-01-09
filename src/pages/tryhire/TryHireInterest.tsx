import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, CheckCircle2 } from 'lucide-react';
import TryHireLayout from '@/components/tryhire/TryHireLayout';
import TryHireSection from '@/components/tryhire/TryHireSection';
import TryHireButton from '@/components/tryhire/TryHireButton';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const hiringInterestSchema = z.object({
  picName: z.string().trim().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  contactNumber: z.string().trim().min(1, "Contact number is required"),
  email: z.string().trim().email("Please enter a valid email"),
  hiringNeeds: z.string().trim().min(1, "Please describe your hiring needs or paste a job ad URL"),
});

type HiringInterestFormData = z.infer<typeof hiringInterestSchema>;

const TryHireInterest = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<HiringInterestFormData>({
    resolver: zodResolver(hiringInterestSchema),
    defaultValues: {
      picName: '',
      contactNumber: '',
      email: '',
      hiringNeeds: '',
    },
  });

  const onSubmit = async (data: HiringInterestFormData) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.functions.invoke('send-hiring-loi', {
        body: data,
      });

      if (error) throw error;

      setIsSubmitted(true);
    } catch (error: any) {
      console.error('Error submitting form:', error);
      toast.error('Failed to submit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <TryHireLayout>
        <TryHireSection className="py-12 sm:py-16">
          <div className="max-w-xl mx-auto text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Thank You!
            </h1>
            <p className="text-lg text-slate-600 mb-6">
              We will email you a <strong className="text-slate-900">Hiring Letter of Intent (LOI)</strong> shortly.
            </p>
            <p className="text-slate-600 mb-8">
              Once you sign and return the LOI, candidates matching your requirements will be automatically sent to you from <strong className="text-orange-600">info@theaihq.net</strong>.
            </p>
            <Link to="/">
              <TryHireButton variant="secondary">
                Back to Home
              </TryHireButton>
            </Link>
          </div>
        </TryHireSection>
      </TryHireLayout>
    );
  }

  return (
    <TryHireLayout>
      <TryHireSection className="py-12 sm:py-16">
        <div className="max-w-xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3 text-center">
            Join FREE
          </h1>
          <p className="text-lg text-slate-600 mb-8 text-center">
            Tell us what you're hiring for. We'll send you a Hiring LOI if there's a fit.
          </p>

          <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 sm:p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField
                  control={form.control}
                  name="picName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>PIC Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contactNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Number</FormLabel>
                      <FormControl>
                        <Input type="tel" placeholder="+60 12-345 6789" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="you@company.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="hiringNeeds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hiring Needs</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Paste your job requirements here, or simply paste a URL link to an existing job ad..."
                          className="min-h-[120px] resize-y"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <TryHireButton 
                  type="submit" 
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Interest'
                  )}
                </TryHireButton>
              </form>
            </Form>
          </div>

          <div className="mt-8 text-center">
            <Link to="/">
              <TryHireButton variant="secondary">
                Back to Home
              </TryHireButton>
            </Link>
          </div>
        </div>
      </TryHireSection>
    </TryHireLayout>
  );
};

export default TryHireInterest;
