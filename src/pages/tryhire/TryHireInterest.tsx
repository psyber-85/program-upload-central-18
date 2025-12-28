import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import TryHireLayout from '@/components/tryhire/TryHireLayout';
import TryHireSection from '@/components/tryhire/TryHireSection';
import TryHireButton from '@/components/tryhire/TryHireButton';
import TryHireInput from '@/components/tryhire/TryHireInput';
import TryHireSelect from '@/components/tryhire/TryHireSelect';
import TryHireCheckbox from '@/components/tryhire/TryHireCheckbox';
import TryHireTextarea from '@/components/tryhire/TryHireTextarea';
import { hiringInterestSchema, HiringInterestFormData } from '@/lib/tryhire/validationSchema';
import { submitHiringInterest } from '@/lib/tryhire/leadService';

const headcountOptions = [
  { value: '1-5', label: '1–5' },
  { value: '5-10', label: '5–10' },
  { value: '10-30', label: '10–30' },
  { value: '30+', label: '30+' },
];

const timelineOptions = [
  { value: 'immediate', label: 'Immediate' },
  { value: '1-3-months', label: '1–3 months' },
  { value: 'exploring', label: 'Exploring' },
];

const TryHireInterest = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<HiringInterestFormData>({
    resolver: zodResolver(hiringInterestSchema),
    defaultValues: {
      companyName: '',
      contactPerson: '',
      email: '',
      roles: '',
      notes: '',
    },
  });

  const onSubmit = async (data: HiringInterestFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const result = await submitHiringInterest({
        companyName: data.companyName,
        contactPerson: data.contactPerson,
        email: data.email,
        roles: data.roles,
        headcount: data.headcount,
        timeline: data.timeline,
        genuineNeed: data.genuineNeed,
        notes: data.notes,
      });

      if (result.ok) {
        navigate(`/thanks${result.id ? `?ref=${result.id}` : ''}`);
      } else {
        setSubmitError(result.error || 'Submission failed. Please try again.');
      }
    } catch {
      setSubmitError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <TryHireLayout>
      <TryHireSection className="py-12 sm:py-16">
        <div className="max-w-xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">
            Submit Hiring Interest
          </h1>
          <p className="text-lg text-slate-600 mb-8">
            Tell us what you're hiring for. We'll follow up if there's a fit.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <TryHireInput
              label="Company Name"
              placeholder="Acme Corporation"
              {...register('companyName')}
              error={errors.companyName?.message}
            />

            <TryHireInput
              label="Contact Person"
              placeholder="John Doe"
              {...register('contactPerson')}
              error={errors.contactPerson?.message}
            />

            <TryHireInput
              label="Work Email"
              type="email"
              placeholder="john@acme.com"
              {...register('email')}
              error={errors.email?.message}
            />

            <TryHireInput
              label="Role(s) Hiring For"
              placeholder="e.g. Customer Service, Data Entry"
              {...register('roles')}
              error={errors.roles?.message}
            />

            <TryHireSelect
              label="Headcount"
              options={headcountOptions}
              placeholder="Select headcount"
              {...register('headcount')}
              error={errors.headcount?.message}
            />

            <TryHireSelect
              label="Hiring Timeline"
              options={timelineOptions}
              placeholder="Select timeline"
              {...register('timeline')}
              error={errors.timeline?.message}
            />

            <TryHireCheckbox
              label="We have a genuine hiring need."
              {...register('genuineNeed')}
              error={errors.genuineNeed?.message}
            />

            <TryHireTextarea
              label="Notes"
              optional
              placeholder="Any additional information..."
              rows={4}
              {...register('notes')}
              error={errors.notes?.message}
            />

            {submitError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{submitError}</p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <TryHireButton 
                type="submit" 
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit'
                )}
              </TryHireButton>
              
              <Link to="/" className="flex-1">
                <TryHireButton 
                  type="button" 
                  variant="secondary"
                  className="w-full"
                >
                  Back to Home
                </TryHireButton>
              </Link>
            </div>
          </form>
        </div>
      </TryHireSection>
    </TryHireLayout>
  );
};

export default TryHireInterest;
