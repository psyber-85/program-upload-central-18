
import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Clock, User, MessageCircle } from 'lucide-react';
import { format } from 'date-fns';
import { fetchCrmLeadActivities } from '@/lib/crm/placeholderFunctions';
import { CRMLeadActivity } from '@/lib/crm/types';

interface CRMActivityHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  leadId: string | null;
}

const CRMActivityHistory: React.FC<CRMActivityHistoryProps> = ({ isOpen, onClose, leadId }) => {
  const [activities, setActivities] = useState<CRMLeadActivity[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && leadId) {
      loadActivities();
    }
  }, [isOpen, leadId]);

  const loadActivities = async () => {
    if (!leadId) return;
    
    setLoading(true);
    try {
      const data = await fetchCrmLeadActivities(leadId);
      setActivities(data.sort((a, b) => new Date(b.crm_timestamp).getTime() - new Date(a.crm_timestamp).getTime()));
    } catch (error) {
      console.error('Failed to load activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'Contacted':
        return <MessageCircle className="h-4 w-4" />;
      case 'Email':
        return <MessageCircle className="h-4 w-4" />;
      case 'Meeting':
        return <User className="h-4 w-4" />;
      case 'Contract':
        return <User className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'Contacted':
        return 'bg-blue-100 text-blue-800';
      case 'Email':
        return 'bg-green-100 text-green-800';
      case 'Meeting':
        return 'bg-purple-100 text-purple-800';
      case 'Contract':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Activity History</DialogTitle>
        </DialogHeader>
        
        {loading ? (
          <div className="text-center py-8">Loading activities...</div>
        ) : activities.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No activities found for this lead.
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.crm_id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getActivityIcon(activity.crm_type)}
                    <Badge className={getActivityColor(activity.crm_type)}>
                      {activity.crm_type}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-500">
                    {format(new Date(activity.crm_timestamp), 'MMM dd, yyyy HH:mm')}
                  </div>
                </div>
                
                <div className="mb-2">
                  <p className="text-sm">{activity.crm_note}</p>
                </div>
                
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <User className="h-3 w-3" />
                  <span>by {activity.crm_userName}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CRMActivityHistory;
