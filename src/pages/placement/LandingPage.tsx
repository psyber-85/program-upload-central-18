import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { StepTimeline, AISkillBadge, Callout } from '@/components/placement/ui';
import { Users, Shield, TrendingUp, ArrowRight, CheckCircle } from 'lucide-react';

const placementSteps = [
  { label: 'Submit Role Request' },
  { label: 'AIHQ Reviews & Matches' },
  { label: 'Review Curated Candidates' },
  { label: 'Interview & Select' },
  { label: 'Training & Placement' },
];

const valueProps = [
  {
    icon: Users,
    title: 'Curated Talent',
    description: 'Hand-picked candidates matched to your specific requirements by our team.',
  },
  {
    icon: Shield,
    title: 'Grant-Backed Training',
    description: 'Access government-supported training schemes to upskill your new hires.',
  },
  {
    icon: TrendingUp,
    title: 'Managed Process',
    description: 'AIHQ coordinates the entire journey from request to placement.',
  },
];

export function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-muted/50 to-background py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-foreground mb-6">
              AI-Ready Talent for Your Business
            </h1>
            <p className="text-lg lg:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              AIHQ manages your talent acquisition from role request to placement. 
              Access curated, AI-skilled candidates backed by government training grants.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-base">
                <Link to="/request-talent">
                  Request AI Talent
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-base">
                <Link to="/contact">Talk to AIHQ</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Value Propositions */}
      <section className="py-16 lg:py-24 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl lg:text-3xl font-semibold text-center text-foreground mb-12">
            Why Work With AIHQ
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {valueProps.map((prop) => (
              <Card key={prop.title} className="border-border/50">
                <CardContent className="pt-6">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <prop.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{prop.title}</h3>
                  <p className="text-muted-foreground">{prop.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Process Overview */}
      <section className="py-16 lg:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl lg:text-3xl font-semibold text-center text-foreground mb-4">
              Train & Place: A Managed Approach
            </h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              AIHQ coordinates each step, from understanding your requirements to placing 
              trained candidates in your organization.
            </p>
            <div className="bg-background rounded-xl p-8 border border-border/50">
              <StepTimeline steps={placementSteps} currentStep={2} />
            </div>
            <div className="text-center mt-8">
              <Button asChild variant="link" className="text-primary">
                <Link to="/how-it-works">
                  Learn more about the process
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* AI Skill Framework Teaser */}
      <section className="py-16 lg:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl lg:text-3xl font-semibold text-center text-foreground mb-4">
              The AI Skill Framework
            </h2>
            <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
              Our structured framework ensures candidates have the right AI capabilities for your needs.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <Card className="text-center p-4 border-border/50">
                <AISkillBadge level="L1" size="lg" />
                <p className="mt-2 text-sm font-medium text-foreground">AI Aware</p>
              </Card>
              <Card className="text-center p-4 border-border/50">
                <AISkillBadge level="L2" size="lg" />
                <p className="mt-2 text-sm font-medium text-foreground">AI User</p>
              </Card>
              <Card className="text-center p-4 border-border/50">
                <AISkillBadge level="L3" size="lg" />
                <p className="mt-2 text-sm font-medium text-foreground">AI Builder</p>
              </Card>
              <Card className="text-center p-4 border-border/50">
                <AISkillBadge level="L4" size="lg" />
                <p className="mt-2 text-sm font-medium text-foreground">AI Architect</p>
              </Card>
            </div>
            <div className="text-center">
              <Button asChild variant="outline">
                <Link to="/ai-skill-framework">
                  Explore the Framework
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Callout */}
      <section className="py-16 lg:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <Callout variant="trust" title="AIHQ Manages the Entire Process">
              <p>
                From your initial role request to candidate interviews and final placement, 
                our team coordinates everything. You focus on your business; we handle the rest.
              </p>
            </Callout>
          </div>
        </div>
      </section>

      {/* Grant Eligibility Note */}
      <section className="py-16 lg:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">
                      Grant-Backed Training Schemes
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Eligible employers may access government-supported training programmes 
                      to upskill candidates before placement. Grant eligibility is subject to 
                      approval and scheme availability. AIHQ will guide you through the 
                      application process.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 lg:py-28 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl lg:text-3xl font-semibold mb-4">
              Ready to Build Your AI-Ready Team?
            </h2>
            <p className="text-primary-foreground/80 mb-8">
              Submit a role request and let AIHQ find the right candidates for your organization.
            </p>
            <Button asChild size="lg" variant="secondary" className="text-base">
              <Link to="/request-talent">
                Request AI Talent
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
