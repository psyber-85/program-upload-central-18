import { BarChart3, Cpu, Monitor, Rocket } from 'lucide-react';
import { cn } from '@/lib/utils';

const skills = [
  { icon: BarChart3, label: 'Data Analytics' },
  { icon: Cpu, label: 'AI Enablement' },
  { icon: Monitor, label: 'Digital Skills' },
  { icon: Rocket, label: 'Future Skills' },
];

const InDemandSkills = () => {
  return (
    <div className="text-center">
      <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-10">
        In Demand Skills for Employers
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-3xl mx-auto">
        {skills.map((skill, index) => (
          <div key={index} className="relative flex flex-col items-center text-center group">
            {/* Number badge */}
            <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 bg-white text-tryhire-coral text-xs font-bold px-2 py-0.5 rounded-full border border-tryhire-coral/20 z-10">
              {index + 1}
            </span>
            
            {/* Icon container */}
            <div 
              className={cn(
                "w-18 h-18 w-[72px] h-[72px] rounded-2xl flex items-center justify-center mb-4",
                "bg-gradient-to-br from-tryhire-coral to-tryhire-orange",
                "shadow-lg shadow-tryhire-coral/20",
                "transform transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-tryhire-coral/30"
              )}
            >
              <skill.icon className="h-8 w-8 text-white" />
            </div>
            
            {/* Text content */}
            <span className="text-sm font-semibold text-slate-700">
              {skill.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InDemandSkills;
