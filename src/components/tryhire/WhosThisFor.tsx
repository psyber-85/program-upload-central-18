import { ShieldCheck, Link2Off, GraduationCap, Eye, CircleDollarSign } from 'lucide-react';
import TryHireCard from './TryHireCard';

const benefits = [
  { icon: ShieldCheck, label: 'Reduced hiring risk' },
  { icon: Link2Off, label: 'Fewer probation failures' },
  { icon: GraduationCap, label: 'Better-prepared junior hires' },
  { icon: Eye, label: 'Observe attitude before hiring' },
  { icon: CircleDollarSign, label: 'No upfront cost' },
];

const WhosThisFor = () => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {benefits.map((benefit, index) => (
        <TryHireCard 
          key={index} 
          variant="outlined"
          className="flex flex-col items-center text-center p-5"
        >
          <benefit.icon className="h-8 w-8 text-tryhire-coral mb-3" />
          <span className="text-sm font-medium text-slate-700 leading-snug">
            {benefit.label}
          </span>
        </TryHireCard>
      ))}
    </div>
  );
};

export default WhosThisFor;
