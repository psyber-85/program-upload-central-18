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
    default: 'bg-white shadow-sm border border-slate-100',
    outlined: 'bg-white border-2 border-slate-200',
    highlight: 'bg-emerald-50 border border-emerald-200',
  };

  return (
    <div className={cn('rounded-xl p-6', variants[variant], className)}>
      {children}
    </div>
  );
};

export default TryHireCard;
