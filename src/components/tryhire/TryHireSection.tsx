import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface TryHireSectionProps {
  children: ReactNode;
  className?: string;
  background?: 'white' | 'gray' | 'accent';
}

const TryHireSection = ({ 
  children, 
  className,
  background = 'white' 
}: TryHireSectionProps) => {
  const backgrounds = {
    white: 'bg-white',
    gray: 'bg-slate-50',
    accent: 'bg-tryhire-peach',
  };

  return (
    <section className={cn('py-16 sm:py-20', backgrounds[background], className)}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {children}
      </div>
    </section>
  );
};

export default TryHireSection;