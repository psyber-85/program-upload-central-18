import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FileDown } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import TryHireButton from './TryHireButton';

const formSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  email: z.string().trim().email('Please enter a valid email').max(255, 'Email must be less than 255 characters'),
  company: z.string().trim().min(1, 'Company is required').max(200, 'Company must be less than 200 characters'),
});

type FormData = z.infer<typeof formSchema>;

const BROCHURE_URL = 'https://nxnpjkthtjaqamrriogp.supabase.co/storage/v1/object/public/signup-forms/TryHire_The_Employer_Guide.pdf';

const BrochureDownloadModal = () => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      company: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('tryhire_brochure_downloads')
        .insert({
          name: data.name,
          email: data.email,
          company: data.company,
        });

      if (error) {
        console.error('Error logging brochure download:', error);
        toast({
          title: 'Error',
          description: 'Failed to process your request. Please try again.',
          variant: 'destructive',
        });
        return;
      }

      // Trigger download
      const link = document.createElement('a');
      link.href = BROCHURE_URL;
      link.target = '_blank';
      link.download = 'TryHire_The_Employer_Guide.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: 'Success!',
        description: 'Your brochure download has started.',
      });

      form.reset();
      setOpen(false);
    } catch (err) {
      console.error('Unexpected error:', err);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <TryHireButton variant="secondary" size="lg">
          <FileDown className="mr-2 h-5 w-5" />
          Download Brochure
        </TryHireButton>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-900">
            Download Employer Brochure
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-slate-600 mb-4">
          Please fill in your details to download the TryHire Employer Guide.
        </p>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your name" {...field} />
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
                    <Input type="email" placeholder="your@email.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="company"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company</FormLabel>
                  <FormControl>
                    <Input placeholder="Company name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="pt-2">
              <TryHireButton
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Processing...' : 'Download Now'}
              </TryHireButton>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default BrochureDownloadModal;
