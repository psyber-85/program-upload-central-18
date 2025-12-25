import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, FileText, Users, MessageSquare, CheckCircle, Calendar, Award, Building2 } from 'lucide-react';

export function HowItWorks() {
  const employerSteps = [
    {
      icon: FileText,
      title: 'Submit Your Requirements',
      description: 'Fill out our talent request form with details about the role, skills needed, and timeline. Our team reviews within 1 business day.',
    },
    {
      icon: Users,
      title: 'Review Matched Candidates',
      description: 'We match candidates from our trained talent pool to your requirements. You receive anonymized profiles to review and shortlist.',
    },
    {
      icon: MessageSquare,
      title: 'Interview & Select',
      description: 'Conduct interviews with shortlisted candidates. We coordinate scheduling and provide interview support.',
    },
    {
      icon: CheckCircle,
      title: 'Onboard with Support',
      description: 'Once selected, we help with onboarding and provide ongoing training tracking for a smooth transition.',
    },
  ];

  const loiInfo = [
    {
      title: 'What is the LOI?',
      description: 'A Letter of Intent confirms your commitment to proceed with candidate interviews. It helps us ensure serious engagement.',
    },
    {
      title: 'When is it required?',
      description: 'Before you can shortlist or request interviews with candidates, we ask for a signed LOI.',
    },
    {
      title: 'What does it cover?',
      description: 'The LOI outlines the role details, expected timeline, and your commitment to the placement process.',
    },
  ];

  const benefits = [
    {
      icon: Award,
      title: 'Grant Support',
      description: 'Many placements qualify for government training grants. We help navigate the application process.',
    },
    {
      icon: Calendar,
      title: 'Structured Timeline',
      description: 'Clear milestones from submission to placement, typically within 4-6 weeks.',
    },
    {
      icon: Building2,
      title: 'Account Management',
      description: 'Dedicated support throughout the hiring process with regular updates.',
    },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-muted/50 to-background">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">How AIHQ Placement Works</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A transparent, streamlined process that connects you with pre-trained talent 
            ready to make an impact at your organization.
          </p>
        </div>
      </section>

      {/* Employer Journey */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8 text-center">Your Hiring Journey</h2>
          <div className="max-w-4xl mx-auto">
            {employerSteps.map((step, index) => (
              <div key={step.title} className="relative flex gap-6 pb-12 last:pb-0">
                {/* Timeline line */}
                {index < employerSteps.length - 1 && (
                  <div className="absolute left-6 top-14 w-0.5 h-full bg-border -translate-x-1/2" />
                )}
                {/* Step number */}
                <div className="relative z-10 flex-shrink-0 w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                  {index + 1}
                </div>
                {/* Content */}
                <div className="flex-1 pt-1">
                  <div className="flex items-center gap-3 mb-2">
                    <step.icon className="h-5 w-5 text-primary" />
                    <h3 className="text-xl font-semibold">{step.title}</h3>
                  </div>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LOI Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold mb-4">Understanding the Letter of Intent</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              The LOI is a key part of our process that ensures meaningful engagement for both parties.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {loiInfo.map((info) => (
              <Card key={info.title} className="bg-background">
                <CardHeader>
                  <CardTitle className="text-lg">{info.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{info.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8 text-center">What You Get</h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {benefits.map((benefit) => (
              <Card key={benefit.title}>
                <CardContent className="pt-6">
                  <benefit.icon className="h-10 w-10 text-primary mb-4" />
                  <h3 className="font-semibold mb-2">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8 text-center">Typical Timeline</h2>
          <div className="max-w-3xl mx-auto">
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">1-2</div>
                <div className="text-sm text-muted-foreground">days to match</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">3-5</div>
                <div className="text-sm text-muted-foreground">days to shortlist</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">1-2</div>
                <div className="text-sm text-muted-foreground">weeks interviews</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">2-4</div>
                <div className="text-sm text-muted-foreground">weeks to placement</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Submit your talent request and our team will be in touch within 1 business day.
          </p>
          <Button size="lg" asChild>
            <Link to="/request-talent">
              Request Talent <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
