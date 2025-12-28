import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import TryHireFooter from './TryHireFooter';

interface TryHireLayoutProps {
  children: ReactNode;
}

const TryHireLayout = ({ children }: TryHireLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Simple Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link 
            to="/tryhire" 
            className="text-xl font-bold text-slate-900 tracking-tight hover:text-emerald-600 transition-colors"
          >
            TryHire
          </Link>
          <Link
            to="/tryhire/interest"
            className="text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
          >
            Submit Interest →
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <TryHireFooter />
    </div>
  );
};

export default TryHireLayout;
