import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Download, Upload, CheckCircle, Clock, FileText, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { usePlacementAuth } from '@/contexts/PlacementAuthContext';
import { roleRepo, loiRepo } from '@/lib/placement/client';
import type { RoleOpening, LOIStatus } from '@/lib/placement/types';

const loiSteps = [
  { status: 'REQUESTED', label: 'LOI Requested', description: 'Download and sign the LOI template' },
  { status: 'DOWNLOADED', label: 'Downloaded', description: 'Template downloaded' },
  { status: 'UPLOADED_SIGNED', label: 'Uploaded', description: 'Pending AIHQ verification' },
  { status: 'VERIFIED', label: 'Verified', description: 'LOI confirmed, proceed with interviews' },
];

function getStepIndex(status: LOIStatus): number {
  if (status === 'NOT_REQUESTED') return -1;
  const idx = loiSteps.findIndex(s => s.status === status);
  return idx >= 0 ? idx : -1;
}

export function RoleLOI() {
  const { roleId } = useParams<{ roleId: string }>();
  const navigate = useNavigate();
  const { session } = usePlacementAuth();
  const { toast } = useToast();
  const [role, setRole] = useState<RoleOpening | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (roleId) loadRole();
  }, [roleId]);

  async function loadRole() {
    setLoading(true);
    try {
      const data = await roleRepo.getById(roleId!);
      if (!data) {
        toast({ title: 'Error', description: 'Role not found', variant: 'destructive' });
        navigate('/employer/roles');
        return;
      }
      setRole(data);
    } catch (error) {
      console.error('Failed to load role:', error);
      toast({ title: 'Error', description: 'Failed to load role', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }

  async function handleDownloadLOI() {
    if (!role) return;
    
    // Simulate download - in real app would fetch actual template
    toast({ title: 'LOI Template', description: 'Download started (stub)' });
    
    // Update status if not already downloaded
    if (role.loiStatus === 'NOT_REQUESTED' || role.loiStatus === 'REQUESTED') {
      try {
        await loiRepo.updateStatus(role.id, 'DOWNLOADED');
        setRole({ ...role, loiStatus: 'DOWNLOADED' });
      } catch (error) {
        console.error('Failed to update LOI status:', error);
      }
    }
  }

  async function handleUploadLOI() {
    if (!role) return;
    
    setUploading(true);
    try {
      // Simulate file upload - in real app would handle actual file
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await loiRepo.updateStatus(role.id, 'UPLOADED_SIGNED');
      setRole({ ...role, loiStatus: 'UPLOADED_SIGNED' });
      toast({ 
        title: 'LOI Uploaded', 
        description: 'Your signed LOI has been submitted for verification' 
      });
    } catch (error) {
      console.error('Failed to upload LOI:', error);
      toast({ title: 'Error', description: 'Failed to upload LOI', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="h-40 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (!role) return null;

  const currentStep = getStepIndex(role.loiStatus);
  const progressPercent = role.loiStatus === 'VERIFIED' ? 100 : 
    role.loiStatus === 'UPLOADED_SIGNED' ? 75 :
    role.loiStatus === 'DOWNLOADED' ? 50 :
    role.loiStatus === 'REQUESTED' ? 25 : 0;

  const isVerified = role.loiStatus === 'VERIFIED';
  const isPending = role.loiStatus === 'UPLOADED_SIGNED';

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(`/employer/roles/${roleId}`)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Letter of Intent</h1>
          <p className="text-muted-foreground">{role.title}</p>
        </div>
      </div>

      {/* Explanation Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            About the Letter of Intent
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            This LOI confirms your intent to hire for this vacancy. It is not a contract. 
            AIHQ uses it to proceed with interview coordination and programme support.
          </p>
          <div className="p-4 rounded-lg bg-muted/50 border border-border">
            <p className="text-sm">
              <strong>What this LOI does:</strong>
            </p>
            <ul className="text-sm text-muted-foreground mt-2 space-y-1">
              <li>• Confirms your intent to hire for this vacancy</li>
              <li>• Enables AIHQ to coordinate interviews on your behalf</li>
              <li>• Activates placement and training support</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Progress Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Status</CardTitle>
          <CardDescription>Track your LOI progress</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Progress value={progressPercent} className="h-2" />
          
          <div className="space-y-4">
            {loiSteps.map((step, index) => {
              const isComplete = currentStep > index || (currentStep === index && role.loiStatus === 'VERIFIED');
              const isCurrent = currentStep === index && role.loiStatus !== 'VERIFIED';
              
              return (
                <div key={step.status} className="flex items-start gap-3">
                  <div className={`
                    mt-0.5 h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0
                    ${isComplete ? 'bg-primary text-primary-foreground' : 
                      isCurrent ? 'bg-primary/20 text-primary border-2 border-primary' : 
                      'bg-muted text-muted-foreground'}
                  `}>
                    {isComplete ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : isCurrent ? (
                      <Clock className="h-3 w-3" />
                    ) : (
                      <span className="text-xs">{index + 1}</span>
                    )}
                  </div>
                  <div>
                    <p className={`font-medium ${isComplete || isCurrent ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {step.label}
                    </p>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      {!isVerified && (
        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Download Button */}
            <Button 
              variant="outline" 
              className="w-full justify-start gap-3"
              onClick={handleDownloadLOI}
            >
              <Download className="h-4 w-4" />
              Download LOI Template
            </Button>

            {/* Upload Button */}
            {(role.loiStatus === 'DOWNLOADED' || role.loiStatus === 'REQUESTED') && (
              <Button 
                className="w-full justify-start gap-3"
                onClick={handleUploadLOI}
                disabled={uploading}
              >
                <Upload className="h-4 w-4" />
                {uploading ? 'Uploading...' : 'Upload Signed LOI'}
              </Button>
            )}

            {/* Pending Notice */}
            {isPending && (
              <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 dark:bg-amber-950/20 dark:border-amber-900">
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-amber-600 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-amber-800 dark:text-amber-400">Verification in Progress</p>
                    <p className="text-sm text-amber-700 dark:text-amber-500">
                      AIHQ is reviewing your signed LOI. This usually takes 1-2 business days.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Success State */}
      {isVerified && (
        <Card className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/20">
          <CardContent className="py-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-green-800 dark:text-green-400">LOI Verified</p>
                <p className="text-sm text-green-700 dark:text-green-500">
                  You can now proceed with interviews. AIHQ will coordinate scheduling.
                </p>
              </div>
            </div>
            <div className="mt-4">
              <Button asChild>
                <Link to={`/employer/roles/${roleId}`}>
                  Back to Role <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
