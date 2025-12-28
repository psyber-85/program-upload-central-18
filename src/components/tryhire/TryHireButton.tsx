import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface TryHireButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

const TryHireButton = forwardRef<HTMLButtonElement, TryHireButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variants = {
      primary: 'bg-gradient-to-r from-tryhire-coral to-tryhire-orange text-white hover:from-tryhire-coral-dark hover:to-tryhire-coral focus:ring-tryhire-coral shadow-sm hover:shadow-md',
      secondary: 'bg-white text-slate-700 border border-slate-300 hover:bg-tryhire-peach hover:border-tryhire-coral/30 focus:ring-tryhire-coral',
      ghost: 'text-slate-600 hover:text-tryhire-coral hover:bg-tryhire-peach focus:ring-tryhire-coral',
    };
    
    const sizes = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);

TryHireButton.displayName = 'TryHireButton';

export default TryHireButton;