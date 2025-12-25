import { FileText, Download, Upload, CheckCircle, Clock, AlertCircle, Lock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import type { LOIStatus } from '@/lib/placement/types';

interface LOIBannerProps {
  status: LOIStatus;
  onDownload?: () => void;
  onUpload?: () => void;
  onVerify?: () => void; // Ops only
  isOps?: boolean;
  className?: string;
}

const statusConfig: Record<LOIStatus, {
  title: string;
  description: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: React.ElementType;
  progress: number;
}> = {
  NOT_REQUESTED: {
    title: 'Letter of Intent Required',
    description: 'Download and sign the LOI to unlock candidate shortlisting',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50 dark:bg-amber-950/20',
    borderColor: 'border-amber-200 dark:border-amber-900',
    icon: AlertCircle,
    progress: 0,
  },
  REQUESTED: {
    title: 'LOI Pending Download',
    description: 'Please download the LOI template to proceed',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50 dark:bg-amber-950/20',
    borderColor: 'border-amber-200 dark:border-amber-900',
    icon: Download,
    progress: 25,
  },
  DOWNLOADED: {
    title: 'LOI Downloaded - Awaiting Signature',
    description: 'Upload the signed LOI to continue with candidates',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-950/20',
    borderColor: 'border-blue-200 dark:border-blue-900',
    icon: Upload,
    progress: 50,
  },
  UPLOADED_SIGNED: {
    title: 'LOI Under Review',
    description: 'AIHQ is verifying your signed Letter of Intent',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 dark:bg-purple-950/20',
    borderColor: 'border-purple-200 dark:border-purple-900',
    icon: Clock,
    progress: 75,
  },
  VERIFIED: {
    title: 'LOI Verified',
    description: 'You can now shortlist and interview candidates',
    color: 'text-green-600',
    bgColor: 'bg-green-50 dark:bg-green-950/20',
    borderColor: 'border-green-200 dark:border-green-900',
    icon: CheckCircle,
    progress: 100,
  },
};

export function LOIBanner({ status, onDownload, onUpload, onVerify, isOps = false, className = '' }: LOIBannerProps) {
  const config = statusConfig[status];
  const StatusIcon = config.icon;

  // Don't show banner if verified (unless minimal)
  if (status === 'VERIFIED' && !isOps) {
    return null;
  }

  return (
    <Card className={`${config.bgColor} ${config.borderColor} ${className}`}>
      <CardContent className="py-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <StatusIcon className={`h-5 w-5 mt-0.5 ${config.color}`} />
            <div className="space-y-1">
              <p className="font-medium">{config.title}</p>
              <p className="text-sm text-muted-foreground">{config.description}</p>
              
              {/* Progress Bar */}
              <div className="flex items-center gap-2 mt-2">
                <Progress value={config.progress} className="h-2 w-32" />
                <span className="text-xs text-muted-foreground">{config.progress}%</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 ml-8 md:ml-0">
            {/* Employer Actions */}
            {!isOps && (
              <>
                {(status === 'NOT_REQUESTED' || status === 'REQUESTED') && onDownload && (
                  <Button onClick={onDownload} size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download LOI
                  </Button>
                )}
                {status === 'DOWNLOADED' && onUpload && (
                  <Button onClick={onUpload} size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Signed LOI
                  </Button>
                )}
                {status === 'UPLOADED_SIGNED' && (
                  <Button disabled size="sm" variant="outline">
                    <Clock className="h-4 w-4 mr-2" />
                    Under Review
                  </Button>
                )}
              </>
            )}

            {/* Ops Actions */}
            {isOps && status === 'UPLOADED_SIGNED' && onVerify && (
              <Button onClick={onVerify} size="sm">
                <CheckCircle className="h-4 w-4 mr-2" />
                Verify LOI
              </Button>
            )}
          </div>
        </div>

        {/* Gating Notice */}
        {status !== 'VERIFIED' && !isOps && (
          <div className="mt-3 pt-3 border-t border-current/10 flex items-center gap-2 text-sm text-muted-foreground">
            <Lock className="h-4 w-4" />
            <span>Shortlisting and interview scheduling are locked until LOI is verified</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Mini version for inline display
export function LOIStatusBadge({ status }: { status: LOIStatus }) {
  const config = statusConfig[status];
  const StatusIcon = config.icon;

  return (
    <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${config.bgColor} ${config.color}`}>
      <StatusIcon className="h-3 w-3" />
      {status === 'VERIFIED' ? 'LOI Verified' : 'LOI Pending'}
    </div>
  );
}
