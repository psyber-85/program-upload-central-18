import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface TryHireInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

const TryHireInput = forwardRef<HTMLInputElement, TryHireInputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const inputId = id || label.toLowerCase().replace(/\s+/g, '-');
    
    return (
      <div className="space-y-1.5">
        <label 
          htmlFor={inputId} 
          className="block text-sm font-medium text-slate-700"
        >
          {label}
        </label>
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'w-full px-4 py-3 rounded-lg border bg-white text-slate-900 placeholder:text-slate-400',
            'focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent',
            'transition-colors duration-200',
            error 
              ? 'border-red-300 focus:ring-red-500' 
              : 'border-slate-300 hover:border-slate-400',
            className
          )}
          {...props}
        />
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }
);

TryHireInput.displayName = 'TryHireInput';

export default TryHireInput;
