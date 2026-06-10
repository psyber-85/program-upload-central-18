import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronDown, ChevronUp, Pencil } from 'lucide-react';
import { useRegistration } from '@/lib/registration/RegistrationContext';
import { RegistrationProgram } from '@/lib/registration/types';
import { supabase } from '@/integrations/supabase/client';
import ProspectTable from '../ProspectTable';
import BulkUploadForm from '../BulkUploadForm';
import ProgramSummary from '../ProgramSummary';
import EditProgramModal from './EditProgramModal';

interface ProgramCardProps {
  program: RegistrationProgram;
}

const ProgramCard: React.FC<ProgramCardProps> = ({ program }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [linksOk, setLinksOk] = useState<boolean | null>(null);
  const { setActiveProgramId, activeProgramId } = useRegistration();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from('program_links')
        .select('signup_form_url, brochure_url')
        .eq('program_title', program.title)
        .maybeSingle();
      if (cancelled) return;
      setLinksOk(Boolean(data?.signup_form_url && data?.brochure_url));
    })();
    return () => {
      cancelled = true;
    };
  }, [program.title, editOpen]);

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
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <CardTitle className="truncate">{program.title}</CardTitle>
              {linksOk === true && (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Links: OK
                </Badge>
              )}
              {linksOk === false && (
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                  Links: Missing
                </Badge>
              )}
            </div>
            {program.pricing != null && (
              <p className="text-sm text-muted-foreground mt-1">
                Pricing: RM{program.pricing.toLocaleString()}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
              <Pencil className="w-4 h-4 mr-2" />
              Edit
            </Button>
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
        </div>
      </CardHeader>

      {isExpanded && activeProgramId === program.id && (
        <CardContent>
          <div className="space-y-6">
            <ProgramSummary programId={program.id} />

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

      <EditProgramModal isOpen={editOpen} onClose={() => setEditOpen(false)} program={program} />
    </Card>
  );
};

export default ProgramCard;
