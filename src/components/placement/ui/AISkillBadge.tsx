import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { AISkillLevel, AI_SKILL_LEVELS } from '@/lib/placement/types';

interface AISkillBadgeProps {
  level: AISkillLevel;
  showLabel?: boolean;
  size?: 'sm' | 'default' | 'lg';
}

const levelColors: Record<AISkillLevel, string> = {
  L1: 'bg-slate-500',
  L2: 'bg-blue-500',
  L3: 'bg-purple-500',
  L4: 'bg-amber-500',
};

export function AISkillBadge({ level, showLabel = false, size = 'default' }: AISkillBadgeProps) {
  const config = AI_SKILL_LEVELS[level];

  const badge = (
    <Badge
      className={cn(
        'font-mono',
        levelColors[level],
        size === 'sm' && 'text-xs px-1.5 py-0',
        size === 'lg' && 'text-base px-3 py-1'
      )}
    >
      {level}
      {showLabel && <span className="ml-1 font-sans">{config.label}</span>}
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
