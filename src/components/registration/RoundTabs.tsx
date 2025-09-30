import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useRegistration } from '@/lib/registration/RegistrationContext';
import AddRoundModal from './AddRoundModal';

const RoundTabs = () => {
  const { rounds, activeRoundId, setActiveRoundId, loading } = useRegistration();
  const [showAddRoundModal, setShowAddRoundModal] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
        <span className="ml-2">Loading rounds...</span>
      </div>
    );
  }

  if (rounds.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <h3 className="text-lg font-semibold mb-2">No Registration Rounds</h3>
        <p className="text-gray-600 mb-4">Create your first registration round to get started</p>
        <Button onClick={() => setShowAddRoundModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Registration Round
        </Button>
        <AddRoundModal open={showAddRoundModal} onClose={() => setShowAddRoundModal(false)} />
      </div>
    );
  }

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Registration Rounds</h2>
        <Button
          onClick={() => setShowAddRoundModal(true)}
          size="sm"
          variant="outline"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Round
        </Button>
      </div>

      <Tabs value={activeRoundId || ''} onValueChange={setActiveRoundId}>
        <TabsList className="w-full justify-start overflow-x-auto">
          {rounds.map((round) => (
            <TabsTrigger key={round.id} value={round.id} className="min-w-[150px]">
              <div className="flex flex-col items-start">
                <span className="font-medium">{round.name}</span>
                {round.start_date && round.end_date && (
                  <span className="text-xs text-muted-foreground">
                    {new Date(round.start_date).toLocaleDateString()} - {new Date(round.end_date).toLocaleDateString()}
                  </span>
                )}
              </div>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <AddRoundModal open={showAddRoundModal} onClose={() => setShowAddRoundModal(false)} />
    </div>
  );
};

export default RoundTabs;
