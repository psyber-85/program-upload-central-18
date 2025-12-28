import { Link } from 'react-router-dom';
import { Check, X, ArrowRight } from 'lucide-react';
import TryHireLayout from '@/components/tryhire/TryHireLayout';
import TryHireSection from '@/components/tryhire/TryHireSection';
import TryHireButton from '@/components/tryhire/TryHireButton';
import TryHireCard from '@/components/tryhire/TryHireCard';

const TryHireHome = () => {
  return (
    <TryHireLayout>
      {/* Hero Section */}
      <TryHireSection className="pt-20 sm:pt-28 pb-16">
        <div className="max-w-3xl">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 tracking-tight leading-tight">
            Hire First-Time Right.
          </h1>
          <p className="mt-4 text-xl text-slate-600">
            We help employers hiring in bulk.
          </p>
          
          <div className="mt-8 space-y-2">
            <p className="text-lg text-slate-700">Candidates train and work first.</p>
            <p className="text-lg text-slate-700">You hire only if satisfied.</p>
          </div>
          
          <p className="mt-6 text-2xl font-semibold text-tryhire-coral">
            Prove first. Hire later.
          </p>
          
          <div className="mt-10">
            <Link to="/interest">
              <TryHireButton size="lg">
                Submit Hiring Interest
                <ArrowRight className="ml-2 h-5 w-5" />
              </TryHireButton>
            </Link>
            <p className="mt-3 text-sm text-slate-500">
              No upfront cost to employers.
            </p>
          </div>
        </div>
      </TryHireSection>

      {/* Comparison Section */}
      <TryHireSection background="gray">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 text-center mb-12">
          Traditional Hiring vs TryHire
        </h2>
        
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Traditional Hiring */}
          <TryHireCard variant="outlined">
            <h3 className="text-lg font-semibold text-slate-500 mb-6">
              Traditional Hiring
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <X className="h-5 w-5 text-slate-400 mt-0.5 shrink-0" />
                <span className="text-slate-600">Interview first</span>
              </li>
              <li className="flex items-start gap-3">
                <X className="h-5 w-5 text-slate-400 mt-0.5 shrink-0" />
                <span className="text-slate-600">Hire on CVs</span>
              </li>
              <li className="flex items-start gap-3">
                <X className="h-5 w-5 text-slate-400 mt-0.5 shrink-0" />
                <span className="text-slate-600">Regret later</span>
              </li>
            </ul>
          </TryHireCard>
          
          {/* TryHire */}
          <TryHireCard variant="highlight">
            <h3 className="text-lg font-semibold text-tryhire-coral mb-6">
              TryHire
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-tryhire-coral mt-0.5 shrink-0" />
                <span className="text-slate-700">Work + training first</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-tryhire-coral mt-0.5 shrink-0" />
                <span className="text-slate-700">Hire on performance</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-tryhire-coral mt-0.5 shrink-0" />
                <span className="text-slate-700">Less regret</span>
              </li>
            </ul>
          </TryHireCard>
        </div>
        
        <p className="text-center mt-10 text-lg text-slate-600">
          You choose when to hire.
        </p>
      </TryHireSection>

      {/* What TryHire Is / Is Not */}
      <TryHireSection>
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div>
            <h3 className="text-xl font-bold text-tryhire-coral mb-4">What TryHire IS</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-tryhire-coral mt-0.5 shrink-0" />
                <span className="text-slate-700">Training-linked placement</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-tryhire-coral mt-0.5 shrink-0" />
                <span className="text-slate-700">Time-bound</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-tryhire-coral mt-0.5 shrink-0" />
                <span className="text-slate-700">Performance-based</span>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-xl font-bold text-slate-500 mb-4">What TryHire IS NOT</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <X className="h-5 w-5 text-slate-400 mt-0.5 shrink-0" />
                <span className="text-slate-600">A job portal</span>
              </li>
              <li className="flex items-start gap-3">
                <X className="h-5 w-5 text-slate-400 mt-0.5 shrink-0" />
                <span className="text-slate-600">A hiring obligation</span>
              </li>
              <li className="flex items-start gap-3">
                <X className="h-5 w-5 text-slate-400 mt-0.5 shrink-0" />
                <span className="text-slate-600">A long-term contract</span>
              </li>
            </ul>
          </div>
        </div>
      </TryHireSection>

      {/* Cost & Commitment Strip */}
      <TryHireSection background="accent">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">
            Cost & Commitment
          </h2>
          <p className="text-lg text-slate-700 mb-4">
            There is no upfront cost to participate in TryHire.
          </p>
          <p className="text-lg text-slate-700 mb-6">
            Employers only decide whether to hire after the placement phase.
          </p>
          <p className="text-sm font-medium text-slate-600">
            Hiring is optional.
          </p>
        </div>
      </TryHireSection>

      {/* Before We Start */}
      <TryHireSection>
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">
            Before We Start
          </h2>
          <p className="text-lg text-slate-600 mb-4">
            We require a simple Hiring Intent Confirmation to confirm there is a real opening.
          </p>
          <p className="text-sm font-semibold text-slate-700">
            This is not a hiring commitment.
          </p>
        </div>
      </TryHireSection>

      {/* FAQ Section */}
      <TryHireSection background="gray">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 text-center mb-12">
          Frequently Asked Questions
        </h2>
        
        <div className="max-w-3xl mx-auto space-y-6">
          <FAQItem 
            question="Do we have to pay to use TryHire?"
            answer="No. There is no upfront cost to employers to participate."
          />
          <FAQItem 
            question="So how does this work without fees?"
            answer="TryHire is supported through training and placement programmes. Employers are not charged."
          />
          <FAQItem 
            question="Are we required to hire anyone?"
            answer="No. Hiring is fully at your discretion."
          />
          <FAQItem 
            question="What roles does this work best for?"
            answer="Bulk or repeated hiring for junior or entry-level roles."
          />
          <FAQItem 
            question="Is this an internship or contract role?"
            answer="No. This is a training-linked placement phase before employment."
          />
        </div>
      </TryHireSection>

      {/* Final CTA */}
      <TryHireSection>
        <div className="text-center">
          <Link to="/interest">
            <TryHireButton size="lg">
              Submit Hiring Interest
              <ArrowRight className="ml-2 h-5 w-5" />
            </TryHireButton>
          </Link>
          <p className="mt-3 text-sm text-slate-500">
            No obligation. No upfront cost.
          </p>
        </div>
      </TryHireSection>
    </TryHireLayout>
  );
};

// FAQ Item Component
interface FAQItemProps {
  question: string;
  answer: string;
}

const FAQItem = ({ question, answer }: FAQItemProps) => {
  return (
    <TryHireCard>
      <h3 className="text-lg font-semibold text-slate-900 mb-2">
        {question}
      </h3>
      <p className="text-slate-600">
        {answer}
      </p>
    </TryHireCard>
  );
};

export default TryHireHome;