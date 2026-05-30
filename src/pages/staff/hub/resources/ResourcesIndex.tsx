import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useHub } from '@/lib/internal-hub/HubContext';
import { resourceRepo } from '@/lib/internal-hub';
import { canAccessAdminArea } from '@/lib/internal-hub/access';
import { RESOURCE_CATEGORY_LABELS, type ResourceCategory } from '@/lib/internal-hub/types';
import { Button } from '@/components/ui/button';
import StartHereCards from '@/components/internal-hub/resources/StartHereCards';
import ResourceCard from '@/components/internal-hub/resources/ResourceCard';
import ITSupportCard from '@/components/internal-hub/resources/ITSupportCard';
import NotionKBCard from '@/components/internal-hub/resources/NotionKBCard';
import { Settings as SettingsIcon } from 'lucide-react';

const CATEGORY_ORDER: ResourceCategory[] = [
  'CompanyTools', 'Policies', 'Benefits', 'OnboardingMaterials', 'YouTubeTraining', 'NotionKB', 'ITSupport',
];

const ResourcesIndex = () => {
  const { currentStaff } = useHub();
  const isAdmin = canAccessAdminArea(currentStaff);
  const resources = useMemo(
    () => (currentStaff ? resourceRepo.visibleFor(currentStaff) : []),
    [currentStaff?.id],
  );

  if (!currentStaff) return null;

  const grouped = CATEGORY_ORDER.map((cat) => ({
    cat,
    items: resources.filter((r) => r.category === cat),
  })).filter((g) => g.items.length > 0 || g.cat === 'NotionKB' || g.cat === 'ITSupport');

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Resources</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Links to AIHQ tools, policies, and training. External links open in a new tab.
          </p>
        </div>
        {isAdmin && (
          <Button asChild variant="outline">
            <Link to="/staff/admin/resources"><SettingsIcon className="h-4 w-4 mr-1" />Manage</Link>
          </Button>
        )}
      </header>

      <section className="space-y-2">
        <h2 className="text-sm font-medium text-foreground">Start Here</h2>
        <StartHereCards />
      </section>

      {grouped.map(({ cat, items }) => (
        <section key={cat} id={cat === 'CompanyTools' ? 'company-tools' : undefined} className="space-y-2">
          <h2 className="text-sm font-medium text-foreground">{RESOURCE_CATEGORY_LABELS[cat]}</h2>
          {cat === 'NotionKB' ? (
            <NotionKBCard joinDate={currentStaff.joinDate} />
          ) : cat === 'ITSupport' ? (
            <ITSupportCard />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {items.map((r) => <ResourceCard key={r.id} resource={r} />)}
            </div>
          )}
        </section>
      ))}
    </div>
  );
};

export default ResourcesIndex;
