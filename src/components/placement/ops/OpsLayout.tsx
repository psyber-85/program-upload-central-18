import { Outlet } from 'react-router-dom';
import { OpsSidebar } from './OpsSidebar';

export function OpsLayout() {
  return (
    <div className="min-h-screen flex">
      <OpsSidebar className="hidden md:flex" />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
