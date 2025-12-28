import { Link } from 'react-router-dom';
import { Check, X, ArrowRight } from 'lucide-react';
import TryHireLayout from '@/components/tryhire/TryHireLayout';
import TryHireSection from '@/components/tryhire/TryHireSection';
import TryHireButton from '@/components/tryhire/TryHireButton';
import TryHireCard from '@/components/tryhire/TryHireCard';
import HowItWorks from '@/components/tryhire/HowItWorks';
import TryHireFAQ from '@/components/tryhire/TryHireFAQ';
import SocialProofStrip from '@/components/tryhire/SocialProofStrip';
import OperatorCard from '@/components/tryhire/OperatorCard';
import BrochureDownloadModal from '@/components/tryhire/BrochureDownloadModal';

const TryHireHome = () => {
  return (
    <TryHireLayout>
      {/* Hero Section */}
      <TryHireSection background="hero" className="pt-20 sm:pt-28 pb-16">
        <div className="max-w-3xl animate-fade-in">
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
          
          <p className="mt-6 text-2xl font-semibold bg-gradient-to-r from-tryhire-coral to-tryhire-orange bg-clip-text text-transparent">
            Prove first. Hire later.
          </p>
          
          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <Link to="/interest">
              <TryHireButton size="lg" className="group">
                Submit Hiring Interest
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </TryHireButton>
            </Link>
            <BrochureDownloadModal />
          </div>
          <p className="mt-3 text-sm text-slate-500">
            No upfront cost to employers.
          </p>
        </div>
      </TryHireSection>

      {/* How It Works Section */}
      <TryHireSection>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 text-center mb-12">
          How It Works
        </h2>
        <HowItWorks />
        <p className="text-center mt-10 text-lg text-slate-600">
          Simple. Transparent. No hidden fees.
        </p>
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
          <TryHireCard variant="highlight" className="border-l-4 border-l-tryhire-coral">
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
          </TryHireCard>
          
          <TryHireCard variant="outlined" className="border-l-4 border-l-slate-300">
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
          </TryHireCard>
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
          <p className="text-sm font-semibold text-tryhire-coral-dark inline-block px-4 py-2 bg-white/60 rounded-full">
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
          <p className="text-sm font-semibold text-slate-700 inline-block px-4 py-2 bg-slate-100 rounded-full">
            This is not a hiring commitment.
          </p>
        </div>
      </TryHireSection>

      {/* FAQ Section */}
      <TryHireSection background="gray">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 text-center mb-12">
          Frequently Asked Questions
        </h2>
        <div className="max-w-3xl mx-auto">
          <TryHireFAQ />
        </div>
      </TryHireSection>

      {/* Social Proof Section */}
      <TryHireSection>
        <SocialProofStrip />
      </TryHireSection>

      {/* Operator Credibility Section */}
      <TryHireSection background="gray">
        <OperatorCard />
      </TryHireSection>

      {/* Final CTA */}
      <TryHireSection className="bg-gradient-to-t from-tryhire-peach/50 to-white">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-6">
            Ready to hire smarter?
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/interest">
              <TryHireButton size="lg" className="group shadow-lg shadow-tryhire-coral/25 hover:shadow-xl hover:shadow-tryhire-coral/30">
                Submit Hiring Interest
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </TryHireButton>
            </Link>
            <BrochureDownloadModal />
          </div>
          <p className="mt-3 text-sm text-slate-500">
            No obligation. No upfront cost.
          </p>
        </div>
      </TryHireSection>
    </TryHireLayout>
  );
};

export default TryHireHome;
