import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface TryHireCheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  error?: string;
}

const TryHireCheckbox = forwardRef<HTMLInputElement, TryHireCheckboxProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const checkboxId = id || label.toLowerCase().replace(/\s+/g, '-').slice(0, 20);
    
    return (
      <div className="space-y-1.5">
        <label 
          htmlFor={checkboxId} 
          className={cn(
            'flex items-start gap-3 cursor-pointer group',
            className
          )}
        >
          <input
            ref={ref}
            type="checkbox"
            id={checkboxId}
            className={cn(
              'mt-1 h-5 w-5 rounded border-slate-300 text-emerald-600',
              'focus:ring-2 focus:ring-emerald-500 focus:ring-offset-0',
              'transition-colors duration-200 cursor-pointer',
              error && 'border-red-300'
            )}
            {...props}
          />
          <span className="text-sm text-slate-700 group-hover:text-slate-900 transition-colors">
            {label}
          </span>
        </label>
        {error && (
          <p className="text-sm text-red-600 ml-8">{error}</p>
        )}
      </div>
    );
  }
);

TryHireCheckbox.displayName = 'TryHireCheckbox';

export default TryHireCheckbox;
