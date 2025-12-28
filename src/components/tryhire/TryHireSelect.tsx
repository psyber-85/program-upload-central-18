import { SelectHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface TryHireSelectOption {
  value: string;
  label: string;
}

interface TryHireSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: TryHireSelectOption[];
  error?: string;
  placeholder?: string;
}

const TryHireSelect = forwardRef<HTMLSelectElement, TryHireSelectProps>(
  ({ className, label, options, error, id, placeholder = 'Select...', ...props }, ref) => {
    const selectId = id || label.toLowerCase().replace(/\s+/g, '-');
    
    return (
      <div className="space-y-1.5">
        <label 
          htmlFor={selectId} 
          className="block text-sm font-medium text-slate-700"
        >
          {label}
        </label>
        <select
          ref={ref}
          id={selectId}
          className={cn(
            'w-full px-4 py-3 rounded-lg border bg-white text-slate-900',
            'focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent',
            'transition-colors duration-200 appearance-none cursor-pointer',
            'bg-[url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%236b7280\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")] bg-[length:1.25rem] bg-[right_0.75rem_center] bg-no-repeat',
            error 
              ? 'border-red-300 focus:ring-red-500' 
              : 'border-slate-300 hover:border-slate-400',
            className
          )}
          {...props}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }
);

TryHireSelect.displayName = 'TryHireSelect';

export default TryHireSelect;
