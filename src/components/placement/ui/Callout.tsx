import { Info, AlertTriangle, CheckCircle, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CalloutProps {
  variant?: 'info' | 'warning' | 'success' | 'trust';
  title?: string;
  children: React.ReactNode;
}

const variants = {
  info: {
    icon: Info,
    containerClass: 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800',
    iconClass: 'text-blue-600 dark:text-blue-400',
    titleClass: 'text-blue-800 dark:text-blue-200',
    textClass: 'text-blue-700 dark:text-blue-300',
  },
  warning: {
    icon: AlertTriangle,
    containerClass: 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800',
    iconClass: 'text-amber-600 dark:text-amber-400',
    titleClass: 'text-amber-800 dark:text-amber-200',
    textClass: 'text-amber-700 dark:text-amber-300',
  },
  success: {
    icon: CheckCircle,
    containerClass: 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800',
    iconClass: 'text-green-600 dark:text-green-400',
    titleClass: 'text-green-800 dark:text-green-200',
    textClass: 'text-green-700 dark:text-green-300',
  },
  trust: {
    icon: ShieldCheck,
    containerClass: 'bg-slate-50 dark:bg-slate-950/20 border-slate-200 dark:border-slate-700',
    iconClass: 'text-slate-600 dark:text-slate-400',
    titleClass: 'text-slate-800 dark:text-slate-200',
    textClass: 'text-slate-700 dark:text-slate-300',
  },
};

export function Callout({ variant = 'info', title, children }: CalloutProps) {
  const config = variants[variant];
  const Icon = config.icon;

  return (
    <div className={cn('rounded-lg border p-4 flex gap-3', config.containerClass)}>
      <Icon className={cn('h-5 w-5 flex-shrink-0 mt-0.5', config.iconClass)} />
      <div className="flex-1">
        {title && (
          <p className={cn('font-medium text-sm mb-1', config.titleClass)}>{title}</p>
        )}
        <div className={cn('text-sm', config.textClass)}>{children}</div>
      </div>
    </div>
  );
}
