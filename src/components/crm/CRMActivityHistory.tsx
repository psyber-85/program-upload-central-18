
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MessageSquare, Phone, Mail } from 'lucide-react';
import { CrmLeadActivity } from '@/lib/crm/types';
import { fetchCrmActivitiesByLead } from '@/lib/crm/placeholderFunctions';

interface CRMActivityHistoryProps {
  leadId: string;
}

const CRMActivityHistory: React.FC<CRMActivityHistoryProps> = ({ leadId }) => {
  const [activities, setActivities] = useState<CrmLeadActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadActivities = async () => {
      try {
        const data = await fetchCrmActivitiesByLead(leadId);
        setActivities(data);
      } catch (error) {
        console.error('Error loading activities:', error);
      } finally {
        setLoading(false);
      }
    };

    loadActivities();
  }, [leadId]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'Call': return <Phone className="h-4 w-4" />;
      case 'Email': return <Mail className="h-4 w-4" />;
      case 'Contacted': return <MessageSquare className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: string) => {
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

  if (loading) {
    return (
      <Card>
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">Loading activities...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Activity History</CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <p className="text-sm text-muted-foreground">No activities recorded for this lead.</p>
        ) : (
          <div className="space-y-4">
            {activities
              .sort((a, b) => new Date(b.crm_timestamp).getTime() - new Date(a.crm_timestamp).getTime())
              .map((activity) => (
                <div key={activity.crm_id} className="flex items-start space-x-3 p-3 border rounded-lg">
                  <div className="flex-shrink-0">
                    <Badge className={getActivityColor(activity.crm_type)}>
                      <div className="flex items-center space-x-1">
                        {getActivityIcon(activity.crm_type)}
                        <span>{activity.crm_type}</span>
                      </div>
                    </Badge>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-foreground">
                        {activity.crm_userName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(activity.crm_timestamp)}
                      </p>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mt-1">
                      {activity.crm_note}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CRMActivityHistory;
