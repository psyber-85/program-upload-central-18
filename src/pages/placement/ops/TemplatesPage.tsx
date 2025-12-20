import { useState } from 'react';
import { FileCode, Upload, Download, Eye, Clock, FileText, File, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileUploadStub } from '@/components/placement/ui';
import { useAuth } from '@/lib/placement/AuthContext';
import { format } from 'date-fns';

interface Template {
  id: string;
  name: string;
  description: string;
  type: 'LOI' | 'OFFER' | 'INTERVIEW_PREP' | 'TRAINING_CERT' | 'OTHER';
  version: string;
  lastUpdated: string;
  updatedBy: string;
}

const mockTemplates: Template[] = [
  {
    id: 'temp-001',
    name: 'Letter of Intent Template',
    description: 'Standard LOI template for placement agreements',
    type: 'LOI',
    version: '2.1',
    lastUpdated: '2024-03-15T10:00:00Z',
    updatedBy: 'Admin User',
  },
  {
    id: 'temp-002',
    name: 'Offer Letter Template',
    description: 'Employment offer letter template with salary and benefits sections',
    type: 'OFFER',
    version: '1.5',
    lastUpdated: '2024-03-10T09:00:00Z',
    updatedBy: 'HR Manager',
  },
  {
    id: 'temp-003',
    name: 'Interview Preparation Guide',
    description: 'Guide for candidates preparing for employer interviews',
    type: 'INTERVIEW_PREP',
    version: '3.0',
    lastUpdated: '2024-03-01T08:00:00Z',
    updatedBy: 'Training Team',
  },
  {
    id: 'temp-004',
    name: 'Training Completion Certificate',
    description: 'Certificate template for program completion',
    type: 'TRAINING_CERT',
    version: '1.2',
    lastUpdated: '2024-02-20T11:00:00Z',
    updatedBy: 'Admin User',
  },
  {
    id: 'temp-005',
    name: 'Candidate Summary Template',
    description: 'Template for presenting candidate profiles to employers',
    type: 'OTHER',
    version: '2.0',
    lastUpdated: '2024-03-05T14:00:00Z',
    updatedBy: 'Placement Ops',
  },
];

export function TemplatesPage() {
  const [templates] = useState<Template[]>(mockTemplates);
  const { hasPermission } = useAuth();

  const canManageTemplates = hasPermission('manage_templates');

  const getTypeIcon = (type: Template['type']) => {
    switch (type) {
      case 'LOI':
        return <FileText className="h-5 w-5 text-blue-600" />;
      case 'OFFER':
        return <File className="h-5 w-5 text-green-600" />;
      case 'INTERVIEW_PREP':
        return <CheckCircle className="h-5 w-5 text-purple-600" />;
      case 'TRAINING_CERT':
        return <FileCode className="h-5 w-5 text-orange-600" />;
      default:
        return <File className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getTypeBadge = (type: Template['type']) => {
    const variants: Record<Template['type'], string> = {
      LOI: 'bg-blue-500/10 text-blue-700 border-blue-500/20',
      OFFER: 'bg-green-500/10 text-green-700 border-green-500/20',
      INTERVIEW_PREP: 'bg-purple-500/10 text-purple-700 border-purple-500/20',
      TRAINING_CERT: 'bg-orange-500/10 text-orange-700 border-orange-500/20',
      OTHER: 'bg-muted text-muted-foreground',
    };
    return variants[type];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Document Templates</h1>
          <p className="text-muted-foreground">
            {templates.length} templates · {canManageTemplates ? 'Full access' : 'View only'}
          </p>
        </div>
        {canManageTemplates && (
          <Button>
            <Upload className="mr-2 h-4 w-4" />
            Upload New Template
          </Button>
        )}
      </div>

      {!canManageTemplates && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="pt-6">
            <p className="text-sm text-amber-700 dark:text-amber-400">
              You have view-only access to templates. Contact an admin to make changes.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Templates Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <Card key={template.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="p-2 rounded-lg bg-muted">{getTypeIcon(template.type)}</div>
                <Badge variant="outline" className={getTypeBadge(template.type)}>
                  {template.type.replace('_', ' ')}
                </Badge>
              </div>
              <CardTitle className="text-lg">{template.name}</CardTitle>
              <CardDescription>{template.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Version</span>
                <Badge variant="secondary">v{template.version}</Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-3 w-3" />
                Updated {format(new Date(template.lastUpdated), 'MMM d, yyyy')}
              </div>
              <div className="text-sm text-muted-foreground">By {template.updatedBy}</div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Eye className="mr-2 h-4 w-4" />
                  Preview
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </div>

              {canManageTemplates && (
                <FileUploadStub
                  label="Upload New Version"
                  onUpload={() => {
                    // Mock upload - in real app would update version
                    console.log('Uploading new version for', template.id);
                  }}
                />
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
