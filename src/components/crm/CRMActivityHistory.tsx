
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { useCRM } from '@/lib/crm/CRMContext';

interface CRMActivityHistoryProps {
  leadId: string;
}

const CRMActivityHistory: React.FC<CRMActivityHistoryProps> = ({ leadId }) => {
  const { activities } = useCRM();

  const leadActivities = activities.filter(activity => activity.crm_leadId === leadId);

  const getActivityTypeColor = (type: string) => {
    switch (type) {
      case 'Call': return 'bg-blue-100 text-blue-800';
      case 'Email': return 'bg-green-100 text-green-800';
      case 'Contacted': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-MY', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (leadActivities.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        No activity history found
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h4 className="font-medium text-sm">Activity History</h4>
      <div className="space-y-2">
        {leadActivities
          .sort((a, b) => new Date(b.crm_timestamp).getTime() - new Date(a.crm_timestamp).getTime())
          .map((activity) => (
            <div key={activity.crm_id} className="border rounded-lg p-3 bg-muted/50">
              <div className="flex items-center justify-between mb-2">
                <Badge className={getActivityTypeColor(activity.crm_type)}>
                  {activity.crm_type}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {formatDate(activity.crm_timestamp)}
                </span>
              </div>
              {activity.crm_note && (
                <p className="text-sm">{activity.crm_note}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                by {activity.crm_userName}
              </p>
            </div>
          ))}
      </div>
    </div>
  );
};

export default CRMActivityHistory;
