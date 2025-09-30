import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { RegistrationRound, RegistrationProgram, Prospect } from './types';

interface RegistrationContextType {
  rounds: RegistrationRound[];
  activeRoundId: string | null;
  programs: RegistrationProgram[];
  activeProgramId: string | null;
  prospects: Prospect[];
  loading: boolean;
  setActiveRoundId: (roundId: string) => void;
  setActiveProgramId: (programId: string | null) => void;
  refreshRounds: () => Promise<void>;
  refreshPrograms: () => Promise<void>;
  refreshProspects: () => Promise<void>;
  refreshAll: () => Promise<void>;
}

const RegistrationContext = createContext<RegistrationContextType | undefined>(undefined);

export const useRegistration = () => {
  const context = useContext(RegistrationContext);
  if (!context) {
    throw new Error('useRegistration must be used within RegistrationProvider');
  }
  return context;
};

interface RegistrationProviderProps {
  children: ReactNode;
}

export const RegistrationProvider: React.FC<RegistrationProviderProps> = ({ children }) => {
  const [rounds, setRounds] = useState<RegistrationRound[]>([]);
  const [activeRoundId, setActiveRoundId] = useState<string | null>(null);
  const [programs, setPrograms] = useState<RegistrationProgram[]>([]);
  const [activeProgramId, setActiveProgramId] = useState<string | null>(null);
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Load rounds on mount
  useEffect(() => {
    loadRounds();

    // Set up real-time subscription for rounds
    const roundsChannel = supabase
      .channel('rounds-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'registration_rounds' }, () => {
        console.log('Rounds changed, refreshing...');
        loadRounds();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(roundsChannel);
    };
  }, []);

  // Load programs when active round changes
  useEffect(() => {
    if (activeRoundId) {
      loadPrograms(activeRoundId);

      // Set up real-time subscription for programs
      const programsChannel = supabase
        .channel('programs-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'registration_programs' }, () => {
          console.log('Programs changed, refreshing...');
          loadPrograms(activeRoundId);
        })
        .subscribe();

      return () => {
        supabase.removeChannel(programsChannel);
      };
    }
  }, [activeRoundId]);

  // Load prospects when active program changes
  useEffect(() => {
    if (activeProgramId) {
      loadProspects(activeProgramId);

      // Set up real-time subscription for prospects
      const prospectsChannel = supabase
        .channel('prospects-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'prospects' }, () => {
          console.log('Prospects changed, refreshing...');
          loadProspects(activeProgramId);
        })
        .subscribe();

      return () => {
        supabase.removeChannel(prospectsChannel);
      };
    }
  }, [activeProgramId]);

  const loadRounds = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('registration_rounds')
        .select('*')
        .order('start_date', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false });

      if (error) throw error;

      setRounds(data as RegistrationRound[] || []);

      // Auto-select first active round if none selected
      if (!activeRoundId && data && data.length > 0) {
        const activeRound = data.find(r => r.status === 'active') || data[0];
        setActiveRoundId(activeRound.id);
      }
    } catch (error) {
      console.error('Error loading rounds:', error);
      toast({
        title: 'Error',
        description: 'Failed to load registration rounds',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadPrograms = async (roundId: string) => {
    try {
      const { data, error } = await supabase
        .from('registration_programs')
        .select('*')
        .eq('round_id', roundId)
        .order('title');

      if (error) throw error;

      setPrograms(data || []);
      // Reset active program when switching rounds
      setActiveProgramId(null);
    } catch (error) {
      console.error('Error loading programs:', error);
      toast({
        title: 'Error',
        description: 'Failed to load programs',
        variant: 'destructive',
      });
    }
  };

  const loadProspects = async (programId: string) => {
    try {
      const { data, error } = await supabase
        .from('prospects')
        .select('*')
        .eq('program_id', programId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setProspects(data as Prospect[] || []);
    } catch (error) {
      console.error('Error loading prospects:', error);
      toast({
        title: 'Error',
        description: 'Failed to load prospects',
        variant: 'destructive',
      });
    }
  };

  const refreshRounds = async () => {
    await loadRounds();
  };

  const refreshPrograms = async () => {
    if (activeRoundId) {
      await loadPrograms(activeRoundId);
    }
  };

  const refreshProspects = async () => {
    if (activeProgramId) {
      await loadProspects(activeProgramId);
    }
  };

  const refreshAll = async () => {
    await loadRounds();
    if (activeRoundId) {
      await loadPrograms(activeRoundId);
    }
    if (activeProgramId) {
      await loadProspects(activeProgramId);
    }
  };

  return (
    <RegistrationContext.Provider
      value={{
        rounds,
        activeRoundId,
        programs,
        activeProgramId,
        prospects,
        loading,
        setActiveRoundId,
        setActiveProgramId,
        refreshRounds,
        refreshPrograms,
        refreshProspects,
        refreshAll,
      }}
    >
      {children}
    </RegistrationContext.Provider>
  );
};
