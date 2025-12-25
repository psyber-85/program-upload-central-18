import { 
  Briefcase, Users, Calendar, FileText, CheckCircle, XCircle, 
  MessageSquare, Upload, Eye, Award, Clock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { ActivityLog, ActivityType } from '@/lib/placement/types';

interface ActivityTimelineProps {
  activities: ActivityLog[];
  maxHeight?: string;
  title?: string;
  showRole?: boolean;
}

const activityConfig: Record<ActivityType, { icon: React.ElementType; color: string }> = {
  ROLE_CREATED: { icon: Briefcase, color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30' },
  ROLE_PUBLISHED: { icon: Eye, color: 'text-green-600 bg-green-100 dark:bg-green-900/30' },
  ROLE_STATUS_CHANGED: { icon: Clock, color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30' },
  CANDIDATE_SUBMITTED: { icon: Users, color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30' },
  CANDIDATE_SHORTLISTED: { icon: CheckCircle, color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30' },
  INTERVIEW_REQUESTED: { icon: Calendar, color: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30' },
  INTERVIEW_SCHEDULED: { icon: Calendar, color: 'text-cyan-600 bg-cyan-100 dark:bg-cyan-900/30' },
  INTERVIEW_COMPLETED: { icon: CheckCircle, color: 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30' },
  CANDIDATE_SELECTED: { icon: Award, color: 'text-green-600 bg-green-100 dark:bg-green-900/30' },
  CANDIDATE_REJECTED: { icon: XCircle, color: 'text-red-600 bg-red-100 dark:bg-red-900/30' },
  LOI_DOWNLOADED: { icon: FileText, color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30' },
  LOI_UPLOADED: { icon: Upload, color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30' },
  LOI_VERIFIED: { icon: CheckCircle, color: 'text-green-600 bg-green-100 dark:bg-green-900/30' },
  PLACEMENT_CONFIRMED: { icon: Award, color: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30' },
  NOTE_ADDED: { icon: MessageSquare, color: 'text-gray-600 bg-gray-100 dark:bg-gray-900/30' },
  OTHER: { icon: Clock, color: 'text-gray-600 bg-gray-100 dark:bg-gray-900/30' },
};

export function ActivityTimeline({ 
  activities, 
  maxHeight = '400px',
  title = 'Activity',
  showRole = false
}: ActivityTimelineProps) {
  const sortedActivities = [...activities].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {sortedActivities.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No activity yet</p>
        ) : (
          <ScrollArea style={{ maxHeight }}>
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />

              <div className="space-y-4">
                {sortedActivities.map((activity, index) => {
                  const config = activityConfig[activity.type] || activityConfig.OTHER;
                  const Icon = config.icon;
                  const isLast = index === sortedActivities.length - 1;

                  return (
                    <div key={activity.id} className="relative flex gap-4">
                      {/* Icon */}
                      <div className={`relative z-10 h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${config.color}`}>
                        <Icon className="h-4 w-4" />
                      </div>

                      {/* Content */}
                      <div className={`flex-1 min-w-0 ${!isLast ? 'pb-4' : ''}`}>
                        <p className="text-sm font-medium">{activity.title}</p>
                        {activity.description && (
                          <p className="text-sm text-muted-foreground mt-0.5">
                            {activity.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <span>{activity.actorName}</span>
                          {showRole && (
                            <>
                              <span>•</span>
                              <span>{activity.actorRole.replace('_', ' ')}</span>
                            </>
                          )}
                          <span>•</span>
                          <span>{formatTimeAgo(activity.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString();
}
