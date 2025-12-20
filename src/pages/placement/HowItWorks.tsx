import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Callout } from '@/components/placement/ui';
import { 
  FileText, 
  Search, 
  Users, 
  MessageSquare, 
  FileSignature, 
  GraduationCap, 
  CheckCircle,
  ArrowRight,
  Clock,
  Shield,
  Sparkles
} from 'lucide-react';

const processSteps = [
  {
    number: 1,
    icon: FileText,
    title: 'Submit Role Request',
    description: 'Tell us about your hiring needs, the role requirements, and the AI skills you\'re looking for. Our team reviews every request personally.',
    duration: 'Day 1',
  },
  {
    number: 2,
    icon: Search,
    title: 'AIHQ Reviews & Matches',
    description: 'Our team analyzes your requirements and identifies suitable candidates from our talent pool. We consider skills, experience, and cultural fit.',
    duration: '2-5 Days',
  },
  {
    number: 3,
    icon: Users,
    title: 'Review Curated Candidates',
    description: 'Receive a shortlist of 2-5 carefully selected candidates. Each profile includes AI skill assessments, experience summary, and our recommendations.',
    duration: 'Week 1-2',
  },
  {
    number: 4,
    icon: MessageSquare,
    title: 'Interview & Select',
    description: 'Conduct interviews with your preferred candidates. AIHQ can assist with scheduling and provide interview guidance if needed.',
    duration: 'Week 2-3',
  },
  {
    number: 5,
    icon: FileSignature,
    title: 'LOI & Grant Processing',
    description: 'Once you\'ve selected a candidate, we help prepare the Letter of Intent and process any applicable grant applications.',
    duration: 'Week 3-4',
  },
  {
    number: 6,
    icon: GraduationCap,
    title: 'Training (If Applicable)',
    description: 'Selected candidates may undergo additional AI skills training through our programmes, often supported by government grants.',
    duration: 'Varies',
  },
  {
    number: 7,
    icon: CheckCircle,
    title: 'Placement & Ongoing Support',
    description: 'The candidate joins your organization. AIHQ remains available for any follow-up support during the initial months.',
    duration: 'Ongoing',
  },
];

const benefits = [
  {
    icon: Clock,
    title: 'Low Effort',
    description: 'No job boards, no screening hundreds of resumes. We bring you a curated shortlist.',
  },
  {
    icon: Shield,
    title: 'Low Risk',
    description: 'Candidates are pre-vetted for AI skills and work readiness before you meet them.',
  },
  {
    icon: Sparkles,
    title: 'Clear Next Steps',
    description: 'At every stage, you know exactly what happens next. No guesswork.',
  },
];

export function HowItWorks() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-muted/50 to-background py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-foreground mb-4">
              A Managed Approach to AI Talent
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From your initial request to final placement, AIHQ coordinates every step. 
              Here's how the process works.
            </p>
          </div>
        </div>
      </section>

      {/* Process Steps */}
      <section className="py-16 lg:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              {processSteps.map((step, index) => (
                <div key={step.number} className="relative">
                  {/* Connector line */}
                  {index < processSteps.length - 1 && (
                    <div className="absolute left-6 top-16 bottom-0 w-0.5 bg-border hidden md:block" />
                  )}
                  
                  <Card className="border-border/50">
                    <CardContent className="pt-6">
                      <div className="flex flex-col md:flex-row md:items-start gap-4">
                        {/* Step number and icon */}
                        <div className="flex items-center gap-4 md:flex-col md:items-center md:w-24 flex-shrink-0">
                          <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                            {step.number}
                          </div>
                          <span className="text-xs text-muted-foreground font-medium md:text-center">
                            {step.duration}
                          </span>
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <step.icon className="h-5 w-5 text-primary" />
                            <h3 className="text-lg font-semibold text-foreground">
                              {step.title}
                            </h3>
                          </div>
                          <p className="text-muted-foreground">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 lg:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl lg:text-3xl font-semibold text-center text-foreground mb-12">
              Benefits for Employers
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {benefits.map((benefit) => (
                <Card key={benefit.title} className="text-center border-border/50">
                  <CardHeader>
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-2">
                      <benefit.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{benefit.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm">{benefit.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Coordination Callout */}
      <section className="py-16 lg:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <Callout variant="info">
              <p className="font-medium mb-2">AIHQ Coordinates Everything</p>
              <p className="text-muted-foreground text-sm">
                You won't need to navigate multiple systems or track complex processes. 
                Our team handles candidate sourcing, grant applications, training coordination, 
                and placement logistics. Your single point of contact keeps you informed 
                at every stage.
              </p>
            </Callout>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl lg:text-3xl font-semibold mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-primary-foreground/80 mb-8">
              Submit a role request and we'll begin the process of finding the right AI talent for your team.
            </p>
            <Button asChild size="lg" variant="secondary" className="text-base">
              <Link to="/request-talent">
                Request Talent Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
