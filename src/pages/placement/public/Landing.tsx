import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  ArrowRight, Users, Building2, CheckCircle2, 
  FileText, BarChart3, MessageSquare, ClipboardList,
  Lightbulb, UserCheck, GraduationCap
} from 'lucide-react';

export function Landing() {
  // Future-ready examples per superprompt
  const futureReadyExamples = [
    {
      icon: ClipboardList,
      title: 'Ops / Admin',
      description: 'SOP drafting, reporting summaries, process documentation',
    },
    {
      icon: MessageSquare,
      title: 'Marketing / Comms',
      description: 'Content drafts, customer replies, feedback analysis',
    },
    {
      icon: BarChart3,
      title: 'Reporting',
      description: 'Data cleanup, management reporting, insight summaries',
    },
    {
      icon: FileText,
      title: 'Project Management',
      description: 'Meeting summaries, action tracking, documentation',
    },
  ];

  // What "future-ready" means
  const futureReadyBullets = [
    'Comfortable using AI tools for everyday work tasks',
    'Can draft, summarize, and organize with AI assistance',
    'Understands practical applications — not deep tech specialists',
  ];

  // How it works steps
  const steps = [
    { step: '01', title: 'Role & JD', description: 'Share your hiring needs with job scope and requirements.' },
    { step: '02', title: 'CVs', description: 'We match and present pre-screened, employer-safe CVs.' },
    { step: '03', title: 'Interviews', description: 'Interview candidates with AIHQ coordination support.' },
    { step: '04', title: 'Selection', description: 'Select your hire. AIHQ handles placement follow-through.' },
  ];

  // Why different from superficial workshops
  const differences = [
    {
      traditional: 'One-day AI workshops',
      aihq: 'Structured programmes with real work application',
    },
    {
      traditional: 'Generic tool introductions',
      aihq: 'Role-specific AI capability building',
    },
    {
      traditional: 'Certificates without practice',
      aihq: 'Demonstrated competency through projects',
    },
  ];

  return (
    <div>
      {/* Hero Section - Per superprompt: NOT deep tech */}
      <section className="relative overflow-hidden bg-gradient-to-b from-muted/50 to-background py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Now accepting employer applications
            </div>
            {/* SUPERPROMPT HEADLINE */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              Hire future-ready staff —{' '}
              <span className="text-primary">not deep tech specialists</span>
            </h1>
            {/* SUPERPROMPT SUBTEXT */}
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Practical AI capability for everyday work. Hire as usual. 
              AIHQ supports interviews, placement coordination, and post-hire training.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" asChild>
                <Link to="/request-talent">
                  Request Talent <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/how-it-works">Learn How It Works</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Section 1: What "future-ready" means */}
      <section className="py-16 border-y border-border bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Lightbulb className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold">What "future-ready" means</h2>
            </div>
            <ul className="space-y-4">
              {futureReadyBullets.map((bullet, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground text-lg">{bullet}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Section 2: Examples (cards) - Per superprompt */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Practical AI for everyday roles</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our candidates are trained to apply AI to real work tasks — not build AI systems.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {futureReadyExamples.map((example) => (
              <Card key={example.title} className="border-border/50 hover:border-primary/50 transition-colors">
                <CardContent className="pt-6">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <example.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{example.title}</h3>
                  <p className="text-sm text-muted-foreground">{example.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Section 3: How It Works (Simple) */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A familiar HR process with AIHQ coordination support.
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {steps.map((item, index) => (
              <div key={item.step} className="relative">
                <div className="text-5xl font-bold text-primary/20 mb-4">{item.step}</div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
                {index < steps.length - 1 && (
                  <ArrowRight className="hidden md:block absolute top-8 -right-4 h-6 w-6 text-muted-foreground/30" />
                )}
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Button variant="outline" asChild>
              <Link to="/how-it-works">Learn More <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Section 4: Why it's different from superficial workshops */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">
              Why it's different from superficial workshops
            </h2>
            <div className="space-y-4">
              {differences.map((diff, i) => (
                <div key={i} className="grid md:grid-cols-2 gap-4 items-center">
                  <div className="p-4 rounded-lg bg-muted/50 border border-border">
                    <p className="text-sm text-muted-foreground line-through">{diff.traditional}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                    <p className="text-sm font-medium flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                      {diff.aihq}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* For Employers Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Built for Singapore Employers</h2>
              <p className="text-muted-foreground mb-6">
                Whether you're a startup or an enterprise, we help you find candidates who are 
                trained, motivated, and ready to contribute from day one.
              </p>
              <ul className="space-y-4">
                {[
                  'Access to government grant support for eligible placements (subject to approval)',
                  'Dedicated coordination throughout the hiring process',
                  'Structured training programmes for seamless onboarding',
                  'Transparent pipeline with real-time updates',
                ].map((item) => (
                  <li key={item} className="flex gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Button asChild>
                  <Link to="/request-talent">Start Hiring Today</Link>
                </Button>
              </div>
            </div>
            <div className="relative">
              <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                <CardContent className="p-8">
                  <Building2 className="h-12 w-12 text-primary mb-4" />
                  <blockquote className="text-lg mb-4">
                    "AIHQ Placement helped us find staff who could actually apply AI to their daily work. 
                    The candidates were well-prepared and hit the ground running."
                  </blockquote>
                  <div>
                    <div className="font-semibold">HR Manager</div>
                    <div className="text-sm text-muted-foreground">Singapore SME</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Find Your Next Hire?</h2>
          <p className="text-primary-foreground/80 max-w-2xl mx-auto mb-8">
            Submit your talent request today and we'll match you with qualified candidates.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link to="/request-talent">Request Talent</Link>
            </Button>
            <Button size="lg" variant="outline" className="bg-transparent border-primary-foreground/30 hover:bg-primary-foreground/10" asChild>
              <Link to="/contact">Talk to AIHQ</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
