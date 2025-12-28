import { GraduationCap, Briefcase, UserCheck, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const steps = [
  {
    icon: GraduationCap,
    title: 'Train',
    description: 'Candidates undergo structured training',
  },
  {
    icon: Briefcase,
    title: 'Work',
    description: 'Real tasks during placement phase',
  },
  {
    icon: UserCheck,
    title: 'Hire',
    description: 'You decide based on performance',
  },
];

const HowItWorks = () => {
  return (
    <div className="relative">
      <div className="grid md:grid-cols-3 gap-8 md:gap-4">
        {steps.map((step, index) => (
          <div key={step.title} className="relative flex flex-col items-center text-center group">
            {/* Connector arrow - hidden on mobile, shown between items on desktop */}
            {index < steps.length - 1 && (
              <div className="hidden md:flex absolute top-10 -right-2 translate-x-1/2 z-10">
                <ArrowRight className="h-6 w-6 text-tryhire-coral/40" />
              </div>
            )}
            
            {/* Icon container */}
            <div 
              className={cn(
                "w-20 h-20 rounded-2xl flex items-center justify-center mb-4",
                "bg-gradient-to-br from-tryhire-coral to-tryhire-orange",
                "shadow-lg shadow-tryhire-coral/20",
                "transform transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-tryhire-coral/30"
              )}
            >
              <step.icon className="h-9 w-9 text-white" />
            </div>
            
            {/* Step number badge */}
            <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 bg-white text-tryhire-coral text-xs font-bold px-2 py-0.5 rounded-full border border-tryhire-coral/20">
              {index + 1}
            </span>
            
            {/* Text content */}
            <h3 className="text-xl font-bold text-slate-900 mb-2">{step.title}</h3>
            <p className="text-slate-600 text-sm max-w-[180px]">{step.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HowItWorks;
