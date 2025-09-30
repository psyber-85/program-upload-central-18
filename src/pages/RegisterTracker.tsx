
import React from 'react';
import { RegistrationProvider } from '@/lib/registration/RegistrationContext';
import RoundTabs from '@/components/registration/RoundTabs';
import ProgramList from '@/components/registration/ProgramList';

const RegisterTracker = () => {
  return (
    <RegistrationProvider>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-screen-xl mx-auto p-4 sm:p-6">
          <h1 className="text-2xl md:text-3xl font-semibold mb-6">
            Programme Registration Tracker
          </h1>

          {/* Registration Round Tabs */}
          <RoundTabs />

          {/* Programs List within Active Round */}
          <ProgramList />
        </div>
      </div>
    </RegistrationProvider>
  );
};

export default RegisterTracker;
