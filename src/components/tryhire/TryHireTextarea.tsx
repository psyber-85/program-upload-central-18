import { TextareaHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface TryHireTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  optional?: boolean;
}

const TryHireTextarea = forwardRef<HTMLTextAreaElement, TryHireTextareaProps>(
  ({ className, label, error, optional, id, ...props }, ref) => {
    const textareaId = id || label.toLowerCase().replace(/\s+/g, '-');
    
    return (
      <div className="space-y-1.5">
        <label 
          htmlFor={textareaId} 
          className="block text-sm font-medium text-slate-700"
        >
          {label}
          {optional && (
            <span className="ml-1 text-slate-400 font-normal">(optional)</span>
          )}
        </label>
        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            'w-full px-4 py-3 rounded-lg border bg-white text-slate-900 placeholder:text-slate-400',
            'focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent',
            'transition-colors duration-200 resize-y min-h-[100px]',
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

TryHireTextarea.displayName = 'TryHireTextarea';

export default TryHireTextarea;
