
import { useState, useEffect } from 'react';
import { supabase } from '../supabase/client';
import { toast } from 'sonner';

const ProgramManager = ({ selectedProgram, setSelectedProgram }) => {
  const [programTitle, setProgramTitle] = useState('');
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('programs').select('*').order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setPrograms(data || []);
    } catch (error) {
      console.error('Error fetching programs:', error);
      toast.error('Failed to load programs');
    } finally {
      setLoading(false);
    }
  };

  const handleAddProgram = async (e) => {
    e.preventDefault();
    
    if (!programTitle.trim()) {
      toast.error('Program title cannot be empty');
      return;
    }
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('programs')
        .insert([{ title: programTitle.trim() }])
        .select();
      
      if (error) throw error;
      
      toast.success('Program added successfully');
      setProgramTitle('');
      fetchPrograms();
    } catch (error) {
      console.error('Error adding program:', error);
      toast.error('Failed to add program');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Program Management</h2>
      
      {/* Add Program Form */}
      <form onSubmit={handleAddProgram} className="mb-6">
        <div className="flex flex-col md:flex-row gap-3">
          <input
            type="text"
            value={programTitle}
            onChange={(e) => setProgramTitle(e.target.value)}
            placeholder="Enter new program title..."
            className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400"
            disabled={loading || !programTitle.trim()}
          >
            {loading ? 'Adding...' : 'Add Program'}
          </button>
        </div>
      </form>
      
      {/* Program Selector */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Select Program for Participants
        </label>
        <select
          value={selectedProgram}
          onChange={(e) => setSelectedProgram(e.target.value)}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading || programs.length === 0}
        >
          <option value="">-- Select a Program --</option>
          {programs.map((program) => (
            <option key={program.id} value={program.title}>
              {program.title}
            </option>
          ))}
        </select>
      </div>
      
      {programs.length === 0 && !loading && (
        <p className="text-gray-500 italic text-sm">No programs added yet. Add your first program above.</p>
      )}
    </div>
  );
};

export default ProgramManager;
