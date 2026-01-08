import { ShieldCheck, Link2Off, GraduationCap, Eye, CircleDollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';

const benefits = [
  { icon: ShieldCheck, label: 'Reduced hiring risk' },
  { icon: Link2Off, label: 'Fewer probation failures' },
  { icon: GraduationCap, label: 'Better-prepared junior hires' },
  { icon: Eye, label: 'Observe attitude before hiring' },
  { icon: CircleDollarSign, label: 'No upfront cost' },
];

const WhosThisFor = () => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 lg:gap-4">
      {benefits.map((benefit, index) => (
        <div key={index} className="relative flex flex-col items-center text-center group">
          {/* Number badge */}
          <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 bg-white text-tryhire-coral text-xs font-bold px-2 py-0.5 rounded-full border border-tryhire-coral/20 z-10">
            {index + 1}
          </span>
          
          {/* Icon container */}
          <div 
            className={cn(
              "w-16 h-16 rounded-2xl flex items-center justify-center mb-4",
              "bg-gradient-to-br from-tryhire-coral to-tryhire-orange",
              "shadow-lg shadow-tryhire-coral/20",
              "transform transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-tryhire-coral/30"
            )}
          >
            <benefit.icon className="h-7 w-7 text-white" />
          </div>
          
          {/* Text content */}
          <span className="text-sm font-semibold text-slate-700 leading-snug max-w-[140px]">
            {benefit.label}
          </span>
        </div>
      ))}
    </div>
  );
};

export default WhosThisFor;
