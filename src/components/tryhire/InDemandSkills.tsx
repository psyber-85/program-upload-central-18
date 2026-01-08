import { BarChart3, Cpu, Monitor, Rocket } from 'lucide-react';
import TryHireCard from './TryHireCard';

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
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
        {skills.map((skill, index) => (
          <TryHireCard 
            key={index} 
            variant="outlined"
            className="flex flex-col items-center text-center p-6"
          >
            <skill.icon className="h-10 w-10 text-tryhire-coral mb-4" />
            <span className="text-sm font-semibold text-slate-700">
              {skill.label}
            </span>
          </TryHireCard>
        ))}
      </div>
    </div>
  );
};

export default InDemandSkills;
