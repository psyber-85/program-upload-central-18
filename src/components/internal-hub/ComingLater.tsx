// Patch 1.3 §22 — Coming-later page pattern.
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Clock } from 'lucide-react';

interface Props {
  feature: string;
  purpose: string;
  plannedFor?: string;
}

const ComingLater = ({ feature, purpose, plannedFor }: Props) => {
  const navigate = useNavigate();
  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto">
      <Button variant="ghost" size="sm" className="mb-4" onClick={() => navigate(-1)}>
        <ArrowLeft className="h-4 w-4 mr-1" /> Back
      </Button>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-muted-foreground" />
            {feature}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p className="text-muted-foreground">{purpose}</p>
          <div className="rounded-md border border-border bg-muted/40 p-3">
            <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Status</div>
            <div className="text-foreground mt-1">
              {plannedFor ? `Planned for ${plannedFor}.` : 'This section is planned for a later build.'}
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            For now, use the available workflow or contact Admin.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ComingLater;
