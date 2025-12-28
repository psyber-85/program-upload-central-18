import { Link } from 'react-router-dom';
import TryHireLayout from '@/components/tryhire/TryHireLayout';
import TryHireSection from '@/components/tryhire/TryHireSection';
import TryHireButton from '@/components/tryhire/TryHireButton';

const TryHireInterest = () => {
  return (
    <TryHireLayout>
      <TryHireSection className="py-12 sm:py-16">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3 text-center">
            Submit Hiring Interest
          </h1>
          <p className="text-lg text-slate-600 mb-8 text-center">
            Tell us what you're hiring for. We'll follow up if there's a fit.
          </p>

          {/* Embedded Google Form */}
          <div className="w-full flex justify-center">
            <iframe 
              src="https://docs.google.com/forms/d/e/1FAIpQLSfTQaMH0-D-Rz7L6jLV0FBeLUSwTw2Ygkov0uRTstPZJrUtuQ/viewform?embedded=true" 
              width="100%" 
              height="1775" 
              frameBorder="0" 
              marginHeight={0} 
              marginWidth={0}
              className="max-w-[640px]"
              title="Hiring Interest Form"
            >
              Loading…
            </iframe>
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
