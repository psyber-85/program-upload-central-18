import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface KPIStatCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: {
    value: number;
    label: string;
  };
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

const variantStyles = {
  default: 'bg-card',
  success: 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800',
  warning: 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800',
  danger: 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800',
};

const iconStyles = {
  default: 'text-muted-foreground',
  success: 'text-green-600 dark:text-green-400',
  warning: 'text-amber-600 dark:text-amber-400',
  danger: 'text-red-600 dark:text-red-400',
};

export function KPIStatCard({ 
  label, 
  value, 
  icon: Icon, 
  trend,
  variant = 'default' 
}: KPIStatCardProps) {
  return (
    <div className={cn(
      'rounded-lg border p-4',
      variantStyles[variant]
    )}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          {trend && (
            <p className={cn(
              'text-xs mt-1',
              trend.value >= 0 ? 'text-green-600' : 'text-red-600'
            )}>
              {trend.value >= 0 ? '+' : ''}{trend.value}% {trend.label}
            </p>
          )}
        </div>
        {Icon && (
          <div className={cn('p-2 rounded-md bg-muted/50', iconStyles[variant])}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
    </div>
  );
}
