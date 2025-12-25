import { Link } from 'react-router-dom';

export function PublicFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <span className="text-sm font-bold text-primary-foreground">AI</span>
              </div>
              <span className="text-lg font-semibold">AIHQ Placement</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Connecting AI-trained talent with forward-thinking employers across Singapore.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/" className="hover:text-primary transition-colors">Home</Link></li>
              <li><Link to="/how-it-works" className="hover:text-primary transition-colors">How It Works</Link></li>
              <li><Link to="/request-talent" className="hover:text-primary transition-colors">Request Talent</Link></li>
              <li><Link to="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* For Employers */}
          <div>
            <h4 className="font-semibold mb-4">For Employers</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/login" className="hover:text-primary transition-colors">Employer Portal</Link></li>
              <li><Link to="/request-talent" className="hover:text-primary transition-colors">Post a Role</Link></li>
              <li><Link to="/how-it-works" className="hover:text-primary transition-colors">Our Process</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Singapore</li>
              <li>
                <a href="mailto:placement@aihq.sg" className="hover:text-primary transition-colors">
                  placement@aihq.sg
                </a>
              </li>
              <li>
                <a href="tel:+6561234567" className="hover:text-primary transition-colors">
                  +65 6123 4567
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {currentYear} AIHQ Placement. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
