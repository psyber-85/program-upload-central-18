import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import TryHireFooter from './TryHireFooter';
import tryhireLogo from '@/assets/tryhire-logo.png';

interface TryHireLayoutProps {
  children: ReactNode;
}

const TryHireLayout = ({ children }: TryHireLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Simple Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link 
            to="/" 
            className="hover:opacity-80 transition-opacity"
          >
            <img 
              src={tryhireLogo} 
              alt="TryHire" 
              className="h-10 sm:h-12 w-auto"
            />
          </Link>
          <Link
            to="/interest"
            className="text-sm font-medium text-tryhire-coral hover:text-tryhire-coral-dark transition-colors"
          >
            Join FREE →
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