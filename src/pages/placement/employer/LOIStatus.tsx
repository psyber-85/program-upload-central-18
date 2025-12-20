import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, FileText, User, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { 
  StatusBadge, 
  StepTimeline, 
  Callout, 
  FileUploadStub,
  LOICallout,
  SafeExitDialog
} from '@/components/placement/ui';
import { useToast } from '@/hooks/use-toast';
import { mockLOIRecords, mockCandidates, mockRoleRequests, mockCompanies } from '@/lib/placement/mockData';
import { CloseReasonType } from '@/lib/placement/types';

const loiSteps = [
  { label: 'Draft Generated', description: 'AIHQ prepares LOI' },
  { label: 'Pending Review', description: 'Review terms' },
  { label: 'Pending Signature', description: 'Sign document' },
  { label: 'Signed', description: 'Complete' },
];

const getLoiStepIndex = (status: string) => {
  switch (status) {
    case 'DRAFT':
      return 0;
    case 'PENDING_REVIEW':
      return 1;
    case 'PENDING_SIGNATURE':
      return 2;
    case 'SIGNED':
    case 'UPLOADED':
      return 4; // All complete
    default:
      return 0;
  }
};

export function LOIStatus() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [acknowledged, setAcknowledged] = useState(false);
  const [safeExitOpen, setSafeExitOpen] = useState(false);

  // Find the LOI
  const loi = mockLOIRecords.find((l) => l.id === id);

  if (!loi) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-2">LOI not found</h2>
        <p className="text-muted-foreground mb-4">This Letter of Intent doesn't exist or has been removed.</p>
        <Button onClick={() => navigate('/employer')}>Back to Dashboard</Button>
      </div>
    );
  }

  // Get related data
  const candidate = mockCandidates.find((c) => c.id === loi.candidate_id);
  const role = mockRoleRequests.find((r) => r.id === loi.role_request_id);
  const company = mockCompanies.find((c) => c.id === loi.company_id);

  const currentStep = getLoiStepIndex(loi.status);

  const handleDownloadDraft = () => {
    toast({
      title: 'Download started',
      description: 'The LOI draft is being downloaded.',
    });
  };

  const handleUploadSigned = () => {
    if (!acknowledged) {
      toast({
        title: 'Acknowledgement required',
        description: 'Please acknowledge that you understand the LOI is not an employment contract.',
        variant: 'destructive',
      });
      return;
    }
    toast({
      title: 'Upload feature',
      description: 'In the full version, you would upload the signed LOI here.',
    });
  };

  const handleHold = () => {
    toast({
      title: 'LOI on hold',
      description: 'Take your time. AIHQ will follow up when you\'re ready.',
    });
  };

  const handleNotProceeding = () => {
    setSafeExitOpen(true);
  };

  const handleSafeExitConfirm = (reason: CloseReasonType, notes?: string) => {
    toast({
      title: 'Not proceeding',
      description: 'AIHQ will close this LOI and coordinate alternatives if appropriate.',
    });
    console.log('Safe exit:', { reason, notes });
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-bold text-foreground">Letter of Intent</h1>
          <StatusBadge status={loi.status} />
        </div>
        <p className="text-muted-foreground">
          Review and manage the LOI for this placement
        </p>
      </div>

      {/* IMPORTANT: LOI ≠ Employment Callout */}
      <LOICallout variant="prominent" />

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>LOI Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <StepTimeline
            steps={loiSteps}
            currentStep={currentStep}
            orientation="horizontal"
          />
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Candidate Info */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Candidate</p>
                <p className="font-medium">{candidate?.display_name || 'Unknown'}</p>
                <p className="text-sm text-muted-foreground">{candidate?.headline}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Role Info */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Role</p>
                <p className="font-medium">{role?.title || 'Unknown'}</p>
                <p className="text-sm text-muted-foreground">{role?.department}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Acknowledgement */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="acknowledge"
              checked={acknowledged}
              onCheckedChange={(checked) => setAcknowledged(checked === true)}
            />
            <div className="space-y-1">
              <Label htmlFor="acknowledge" className="text-sm font-medium cursor-pointer">
                I understand that this LOI is not an employment contract
              </Label>
              <p className="text-xs text-muted-foreground">
                By checking this box, I acknowledge that signing this LOI enables AIHQ to proceed with 
                training coordination and grant workflow, but does not obligate me to hire the candidate. 
                The final hiring decision will be made after training completion.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* LOI Document Section */}
      <Card>
        <CardHeader>
          <CardTitle>LOI Document</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Download Draft */}
          {loi.generated_at && (
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-muted-foreground" />
                <div>
                  <p className="font-medium">LOI Draft</p>
                  <p className="text-sm text-muted-foreground">
                    Generated on {new Date(loi.generated_at).toLocaleDateString('en-MY')}
                  </p>
                </div>
              </div>
              <Button variant="outline" onClick={handleDownloadDraft}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          )}

          <Separator />

          {/* Upload Signed */}
          <div>
            <h4 className="font-medium mb-2">Upload Signed LOI</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Once you've reviewed and signed the LOI, upload the signed document here.
            </p>
            <FileUploadStub
              label="Upload signed LOI"
              accept=".pdf"
              onUpload={handleUploadSigned}
            />
          </div>

          {/* Signed info */}
          {loi.signed_at && (
            <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-sm text-green-700 dark:text-green-300">
                <strong>Signed on:</strong> {new Date(loi.signed_at).toLocaleDateString('en-MY')}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-3">
            <Button onClick={handleUploadSigned} disabled={!acknowledged}>
              Proceed with LOI
            </Button>
            <Button variant="outline" onClick={handleHold}>
              Hold for Now
            </Button>
            <Button 
              variant="ghost" 
              className="text-muted-foreground"
              onClick={handleNotProceeding}
            >
              Not Proceeding
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Not proceeding is a supported option. AIHQ will coordinate alternatives if appropriate.
          </p>
        </CardContent>
      </Card>

      {/* Grant Info Callout */}
      <Callout variant="info" title="Grant Eligibility">
        This placement may be eligible for grant-backed training schemes. AIHQ will advise on available options and coordinate the application process if applicable.
      </Callout>

      {/* Trust Callout */}
      <Callout variant="trust">
        AIHQ coordinates all LOI processing and will guide you through each step. Contact us if you have any questions.
      </Callout>

      {/* Safe Exit Dialog */}
      <SafeExitDialog
        open={safeExitOpen}
        onOpenChange={setSafeExitOpen}
        onConfirm={handleSafeExitConfirm}
        context="loi"
      />
    </div>
  );
}
