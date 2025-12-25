import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Users, Building2, GraduationCap, TrendingUp, CheckCircle2, Zap } from 'lucide-react';

export function Landing() {
  const stats = [
    { value: '500+', label: 'Candidates Placed' },
    { value: '120+', label: 'Partner Companies' },
    { value: '95%', label: 'Placement Success' },
    { value: '4.8', label: 'Employer Rating' },
  ];

  const features = [
    {
      icon: GraduationCap,
      title: 'AI-Trained Talent',
      description: 'Access candidates who have completed rigorous AI and tech training programmes.',
    },
    {
      icon: Users,
      title: 'Pre-Screened Candidates',
      description: 'Every candidate is vetted and matched to your specific requirements.',
    },
    {
      icon: TrendingUp,
      title: 'Ongoing Support',
      description: 'We provide training tracking and grant support throughout the placement.',
    },
    {
      icon: Zap,
      title: 'Fast Matching',
      description: 'Get matched candidates within days, not weeks.',
    },
  ];

  const steps = [
    { step: '01', title: 'Submit Your Role', description: 'Tell us about your hiring needs and requirements.' },
    { step: '02', title: 'Review Candidates', description: 'We match and present pre-screened candidates.' },
    { step: '03', title: 'Interview & Select', description: 'Interview candidates and make your selection.' },
    { step: '04', title: 'Onboard & Train', description: 'We support the training and placement process.' },
  ];

  return (
    <div>
      {/* Hero Section */}
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
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              Hire AI-Ready Talent{' '}
              <span className="text-primary">for Your Business</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Connect with pre-trained, job-ready candidates from Singapore's leading AI training programmes. 
              We handle the matching, you get the talent.
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

      {/* Stats Section */}
      <section className="py-12 border-y border-border bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Partner With Us?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We bridge the gap between trained talent and growing businesses, 
              making hiring simpler and more effective.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <Card key={feature.title} className="border-border/50 hover:border-primary/50 transition-colors">
                <CardContent className="pt-6">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Preview */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A simple, streamlined process to get you the talent you need.
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

      {/* For Employers Section */}
      <section className="py-20">
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
                  'Access to government grant support for eligible placements',
                  'Dedicated account management throughout the process',
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
                    "AIHQ Placement helped us find three AI engineers in under a month. 
                    The candidates were well-prepared and hit the ground running."
                  </blockquote>
                  <div>
                    <div className="font-semibold">Sarah Tan</div>
                    <div className="text-sm text-muted-foreground">CTO, TechVentures Pte Ltd</div>
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
            Submit your talent request today and we'll match you with qualified candidates within days.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link to="/request-talent">Request Talent</Link>
            </Button>
            <Button size="lg" variant="outline" className="bg-transparent border-primary-foreground/30 hover:bg-primary-foreground/10" asChild>
              <Link to="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
