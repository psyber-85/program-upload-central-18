import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Construction } from 'lucide-react';

interface Props {
  title: string;
  description?: string;
  owningCard?: string;
}

const ComingSoonStub = ({ title, description, owningCard }: Props) => (
  <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-4">
    <Button asChild variant="ghost" size="sm" className="-ml-2">
      <Link to="/staff"><ArrowLeft className="h-4 w-4 mr-1" />Back to Home</Link>
    </Button>
    <Card>
      <CardContent className="p-8 flex flex-col items-center text-center gap-3">
        <Construction className="h-8 w-8 text-muted-foreground" />
        <h1 className="text-xl font-semibold text-foreground">{title}</h1>
        {description && <p className="text-sm text-muted-foreground max-w-prose">{description}</p>}
        {owningCard && (
          <p className="text-xs text-muted-foreground">
            This area is owned by {owningCard}. The page is reserved so Home links work today.
          </p>
        )}
      </CardContent>
    </Card>
  </div>
);

export default ComingSoonStub;
