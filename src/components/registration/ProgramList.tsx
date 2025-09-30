import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useRegistration } from '@/lib/registration/RegistrationContext';
import ProgramCard from './ProgramCard';
import AddProgramForm from '../AddProgramForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const ProgramList = () => {
  const { programs, activeRoundId, loading } = useRegistration();
  const [showAddProgramModal, setShowAddProgramModal] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
        <span className="ml-2">Loading programs...</span>
      </div>
    );
  }

  if (!activeRoundId) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-gray-600">Please select a registration round to view programs</p>
      </div>
    );
  }

  if (programs.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <h3 className="text-lg font-semibold mb-2">No Programs in This Round</h3>
        <p className="text-gray-600 mb-4">Add programs to this registration round to start managing prospects</p>
        <Button onClick={() => setShowAddProgramModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Program
        </Button>
        <Dialog open={showAddProgramModal} onOpenChange={setShowAddProgramModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Program to Round</DialogTitle>
            </DialogHeader>
            <AddProgramForm onProgramAdded={() => setShowAddProgramModal(false)} />
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Programs ({programs.length})</h3>
        <Button onClick={() => setShowAddProgramModal(true)} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Program
        </Button>
      </div>

      <div className="space-y-4">
        {programs.map((program) => (
          <ProgramCard key={program.id} program={program} />
        ))}
      </div>

      <Dialog open={showAddProgramModal} onOpenChange={setShowAddProgramModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Program to Round</DialogTitle>
          </DialogHeader>
          <AddProgramForm onProgramAdded={() => setShowAddProgramModal(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProgramList;
