import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import TryHireLayout from '@/components/tryhire/TryHireLayout';
import TryHireSection from '@/components/tryhire/TryHireSection';
import TryHireButton from '@/components/tryhire/TryHireButton';

const TryHireThanks = () => {
  const [searchParams] = useSearchParams();
  const refId = searchParams.get('ref');

  return (
    <TryHireLayout>
      <TryHireSection className="py-20 sm:py-32">
        <div className="max-w-lg mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-emerald-100 rounded-full">
              <CheckCircle className="h-12 w-12 text-emerald-600" />
            </div>
          </div>
          
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Thanks — received.
          </h1>
          
          <p className="text-lg text-slate-600 mb-8">
            We'll review and reach out if there's a fit.
          </p>
          
          {refId && (
            <p className="text-sm text-slate-400 mb-8">
              Reference: {refId.slice(0, 8)}
            </p>
          )}
          
          <Link to="/tryhire">
            <TryHireButton>
              Back to Home
            </TryHireButton>
          </Link>
        </div>
      </TryHireSection>
    </TryHireLayout>
  );
};

export default TryHireThanks;
