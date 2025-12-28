import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface TryHireCardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'outlined' | 'highlight';
}

const TryHireCard = ({ 
  children, 
  className,
  variant = 'default' 
}: TryHireCardProps) => {
  const variants = {
    default: 'bg-white shadow-md border border-slate-100 hover:shadow-lg',
    outlined: 'bg-white border-2 border-slate-200 hover:border-slate-300 hover:shadow-md',
    highlight: 'bg-gradient-to-br from-tryhire-peach to-white border border-tryhire-coral/20 hover:shadow-lg hover:border-tryhire-coral/40',
  };

  return (
    <div 
      className={cn(
        'rounded-xl p-6 transition-all duration-300',
        variants[variant], 
        className
      )}
    >
      {children}
    </div>
  );
};

export default TryHireCard;