import { Outlet } from 'react-router-dom';
import { EmployerSidebar } from './EmployerSidebar';

export function EmployerLayout() {
  return (
    <div className="min-h-screen flex">
      <EmployerSidebar className="hidden md:flex" />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
