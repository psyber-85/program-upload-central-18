import { AlertTriangle, Shield, ShieldAlert } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { BypassRiskLevel } from '@/lib/placement/types';

interface RiskFlagBadgeProps {
  level: BypassRiskLevel;
  showLabel?: boolean;
  className?: string;
}

const riskConfig: Record<BypassRiskLevel, {
  label: string;
  description: string;
  icon: typeof Shield;
  className: string;
}> = {
  low: {
    label: 'Low Risk',
    description: 'No indicators of bypass behavior',
    icon: Shield,
    className: 'bg-green-100 text-green-700 border-green-300 dark:bg-green-950 dark:text-green-300 dark:border-green-800',
  },
  medium: {
    label: 'Medium Risk',
    description: 'Some indicators - monitor closely',
    icon: AlertTriangle,
    className: 'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800',
  },
  high: {
    label: 'High Risk',
    description: 'Multiple indicators of potential bypass',
    icon: ShieldAlert,
    className: 'bg-red-100 text-red-700 border-red-300 dark:bg-red-950 dark:text-red-300 dark:border-red-800',
  },
};

/**
 * Internal-only badge showing bypass risk level
 * Should never be visible to employers
 */
export function RiskFlagBadge({ level, showLabel = false, className }: RiskFlagBadgeProps) {
  const config = riskConfig[level];
  const Icon = config.icon;

  const badge = (
    <Badge
      variant="outline"
      className={cn(
        'text-xs font-medium',
        config.className,
        className
      )}
    >
      <Icon className="h-3 w-3 mr-1" />
      {showLabel ? config.label : level.toUpperCase()}
    </Badge>
  );

  if (showLabel) {
    return badge;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{badge}</TooltipTrigger>
      <TooltipContent>
        <p className="font-medium">{config.label}</p>
        <p className="text-xs text-muted-foreground">{config.description}</p>
      </TooltipContent>
    </Tooltip>
  );
}
