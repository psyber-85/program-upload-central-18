import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface TryHireSectionProps {
  children: ReactNode;
  className?: string;
  background?: 'white' | 'gray' | 'accent' | 'hero';
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
    hero: 'bg-gradient-to-br from-white via-tryhire-peach/30 to-tryhire-peach/50 relative overflow-hidden',
  };

  return (
    <section className={cn('py-16 sm:py-20', backgrounds[background], className)}>
      {/* Decorative elements for hero background */}
      {background === 'hero' && (
        <>
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-tryhire-coral/10 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-tr from-tryhire-orange/10 to-transparent rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />
        </>
      )}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
        {children}
      </div>
    </section>
  );
};

export default TryHireSection;