import { Link } from 'react-router-dom';

const TryHireFooter = () => {
  return (
    <footer className="border-t border-slate-100 bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500">
            TryHire is powered by AIHQ Sdn Bhd (1651383-T)
          </p>
          <div className="flex items-center gap-6">
            <Link 
              to="/privacy" 
              className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
            >
              Privacy
            </Link>
            <a 
              href="mailto:info@theaihq.net" 
              className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
            >
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default TryHireFooter;
