import { Link } from 'react-router-dom';
import TryHireLayout from '@/components/tryhire/TryHireLayout';
import TryHireSection from '@/components/tryhire/TryHireSection';

const TryHirePrivacy = () => {
  return (
    <TryHireLayout>
      <TryHireSection className="py-12 sm:py-16">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-8">
            Privacy Policy
          </h1>

          <div className="prose prose-slate max-w-none">
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-3">
                Data We Collect
              </h2>
              <p className="text-slate-600 mb-4">
                When you submit a hiring interest form, we collect:
              </p>
              <ul className="list-disc list-inside text-slate-600 space-y-2">
                <li>Company name</li>
                <li>Contact person name</li>
                <li>Work email address</li>
                <li>Role(s) you're hiring for</li>
                <li>Expected headcount</li>
                <li>Hiring timeline</li>
                <li>Any additional notes you provide</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-3">
                Purpose
              </h2>
              <p className="text-slate-600">
                We use this information solely to understand your hiring needs and determine if TryHire can help. We may contact you to discuss potential placement opportunities. We do not sell or share your data with third parties for marketing purposes.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-3">
                Retention
              </h2>
              <p className="text-slate-600">
                We retain your data for as long as necessary to fulfil the purposes outlined above, or as required by law. You may request deletion of your data at any time.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-3">
                Contact
              </h2>
              <p className="text-slate-600">
                If you have any questions about this privacy policy or wish to request deletion of your data, please contact us at{' '}
                <a 
                  href="mailto:hello@theaihq.net" 
                  className="text-emerald-600 hover:text-emerald-700 underline"
                >
                  hello@theaihq.net
                </a>
              </p>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-slate-200">
            <Link 
              to="/"
              className="text-emerald-600 hover:text-emerald-700 font-medium"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </TryHireSection>
    </TryHireLayout>
  );
};

export default TryHirePrivacy;
