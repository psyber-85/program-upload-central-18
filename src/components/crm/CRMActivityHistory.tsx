
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { History, Clock, User, MessageSquare } from 'lucide-react';
import { CRMLeadActivity } from '../../lib/crm/types';
import { fetchCrmActivitiesByLead } from '../../lib/crm/placeholderFunctions';

interface CRMActivityHistoryProps {
  leadId: string;
}

export const CRMActivityHistory: React.FC<CRMActivityHistoryProps> = ({ leadId }) => {
  const [open, setOpen] = useState(false);
  const [activities, setActivities] = useState<CRMLeadActivity[]>([]);
  const [loading, setLoading] = useState(false);

  const loadActivities = async () => {
    setLoading(true);
    try {
      const activitiesData = await fetchCrmActivitiesByLead(leadId);
      setActivities(activitiesData.sort((a, b) => 
        new Date(b.crm_timestamp).getTime() - new Date(a.crm_timestamp).getTime()
      ));
    } catch (error) {
      console.error('Error loading activities:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      loadActivities();
    }
  }, [open, leadId]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'Call':
        return <History className="h-4 w-4" />;
      case 'Email':
        return <MessageSquare className="h-4 w-4" />;
      case 'Meeting':
        return <User className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getActivityBadge = (type: string) => {
    const variants = {
      'Call': 'bg-blue-100 text-blue-800',
      'Email': 'bg-green-100 text-green-800',
      'Meeting': 'bg-purple-100 text-purple-800',
      'Contacted': 'bg-gray-100 text-gray-800',
      'Follow-up': 'bg-orange-100 text-orange-800'
    };
    return variants[type as keyof typeof variants] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <History className="h-4 w-4 mr-1" />
          History
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Activity History</DialogTitle>
        </DialogHeader>
        
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-500">Loading activities...</div>
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-500">No activities recorded yet</div>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.crm_id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {getActivityIcon(activity.crm_type)}
                    <Badge className={getActivityBadge(activity.crm_type)}>
                      {activity.crm_type}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(activity.crm_timestamp).toLocaleString()}
                  </div>
                </div>
                
                {activity.crm_note && (
                  <div className="text-sm text-gray-700 mb-2">
                    {activity.crm_note}
                  </div>
                )}
                
                <div className="flex items-center space-x-1 text-xs text-gray-500">
                  <User className="h-3 w-3" />
                  <span>By {activity.crm_userName}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
