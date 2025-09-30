import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useRegistration } from '@/lib/registration/RegistrationContext';
import { RegistrationProgram } from '@/lib/registration/types';
import ProspectTable from '../ProspectTable';
import BulkUploadForm from '../BulkUploadForm';
import ProgramSummary from '../ProgramSummary';

interface ProgramCardProps {
  program: RegistrationProgram;
}

const ProgramCard: React.FC<ProgramCardProps> = ({ program }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { setActiveProgramId, activeProgramId } = useRegistration();

  const handleToggle = () => {
    if (isExpanded) {
      setIsExpanded(false);
      setActiveProgramId(null);
    } else {
      setIsExpanded(true);
      setActiveProgramId(program.id);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{program.title}</CardTitle>
            {program.pricing && (
              <p className="text-sm text-muted-foreground mt-1">
                Pricing: ${program.pricing.toLocaleString()}
              </p>
            )}
          </div>
          <Button variant="outline" size="sm" onClick={handleToggle}>
            {isExpanded ? (
              <>
                <ChevronUp className="w-4 h-4 mr-2" />
                Collapse
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4 mr-2" />
                Expand
              </>
            )}
          </Button>
        </div>
      </CardHeader>

      {isExpanded && activeProgramId === program.id && (
        <CardContent>
          <div className="space-y-6">
            {/* Program Summary */}
            <ProgramSummary programId={program.id} />

            {/* Tabs for Prospects and Bulk Upload */}
            <Tabs defaultValue="prospects">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="prospects">Prospect List</TabsTrigger>
                <TabsTrigger value="upload">Bulk Upload</TabsTrigger>
              </TabsList>

              <TabsContent value="prospects" className="mt-4">
                <ProspectTable programId={program.id} />
              </TabsContent>

              <TabsContent value="upload" className="mt-4">
                <BulkUploadForm programId={program.id} />
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default ProgramCard;
