import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RoleCard, EmptyState } from '@/components/placement/ui';
import { useAuth } from '@/lib/placement/AuthContext';
import { mockRoleRequests, mockMatches } from '@/lib/placement/mockData';

type FilterTab = 'all' | 'active' | 'completed';

export function RolesList() {
  const { user, hasRole } = useAuth();
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const companyId = user?.company_id;

  // Filter roles for this company
  const companyRoles = mockRoleRequests.filter((r) => r.company_id === companyId);

  // Apply tab filter
  const filteredRoles = companyRoles.filter((role) => {
    if (activeTab === 'active') {
      return !['PLACED', 'CLOSED'].includes(role.status);
    }
    if (activeTab === 'completed') {
      return ['PLACED', 'CLOSED'].includes(role.status);
    }
    return true;
  });

  // Sort by updated date (most recent first)
  const sortedRoles = [...filteredRoles].sort(
    (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  );

  // Get candidate counts
  const getCandidateCount = (roleId: string) => {
    return mockMatches.filter((m) => m.role_request_id === roleId).length;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Role Requests</h1>
          <p className="text-muted-foreground">
            Manage your AI talent requests
          </p>
        </div>
        {hasRole('employer_owner') && (
          <Button asChild>
            <Link to="/employer/roles/new">
              <Plus className="h-4 w-4 mr-2" />
              New Role Request
            </Link>
          </Button>
        )}
      </div>

      {/* Filter Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as FilterTab)}>
        <TabsList>
          <TabsTrigger value="all">
            All ({companyRoles.length})
          </TabsTrigger>
          <TabsTrigger value="active">
            Active ({companyRoles.filter((r) => !['PLACED', 'CLOSED'].includes(r.status)).length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({companyRoles.filter((r) => ['PLACED', 'CLOSED'].includes(r.status)).length})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Roles List */}
      {sortedRoles.length > 0 ? (
        <div className="space-y-3">
          {sortedRoles.map((role) => (
            <RoleCard
              key={role.id}
              role={role}
              candidateCount={getCandidateCount(role.id)}
              linkTo={`/employer/roles/${role.id}`}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={FileText}
          title={activeTab === 'all' ? 'No role requests yet' : `No ${activeTab} roles`}
          description={
            activeTab === 'all'
              ? 'Submit your first role request and AIHQ will find curated AI talent for you.'
              : undefined
          }
          actionLabel={hasRole('employer_owner') && activeTab === 'all' ? 'Submit Role Request' : undefined}
          actionHref={hasRole('employer_owner') ? '/employer/roles/new' : undefined}
        />
      )}
    </div>
  );
}
