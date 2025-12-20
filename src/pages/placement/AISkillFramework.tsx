import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AISkillBadge, Callout } from '@/components/placement/ui';
import { ArrowRight, CheckCircle, Lightbulb, Target } from 'lucide-react';

// WORKPLACE AI SKILL LEVELS - NOT engineering
const skillLevels = [
  {
    level: 'L1' as const,
    name: 'AI Awareness (Workplace)',
    tagline: 'Understanding AI Basics for Work',
    description: 'Professionals at this level understand AI basics, use ChatGPT safely for drafting and summarising, and can follow company AI policies and best practices.',
    capabilities: [
      'Understands basic AI concepts and safe usage principles',
      'Uses AI tools like ChatGPT for drafting emails, meeting notes, and summaries',
      'Follows company policies on data sensitivity and AI usage',
      'Recognizes opportunities where AI could improve daily tasks',
    ],
    suitableFor: 'Roles requiring general AI literacy and basic tool adoption across any department.',
  },
  {
    level: 'L2' as const,
    name: 'AI Workplace User',
    tagline: 'Proficient Daily AI Usage',
    description: 'These professionals use AI daily to improve output quality and speed, create repeatable prompting workflows, and understand data sensitivity in AI interactions.',
    capabilities: [
      'Uses AI tools daily to improve work quality and speed',
      'Creates and documents repeatable prompting workflows',
      'Understands data sensitivity and appropriate AI usage',
      'Applies AI to routine tasks like reporting, documentation, and communication',
      'Trains colleagues on basic AI tool usage',
    ],
    suitableFor: 'Admin, operations, customer service, and knowledge worker roles seeking productivity gains.',
  },
  {
    level: 'L3' as const,
    name: 'AI Workflow Automation Specialist',
    tagline: 'Building AI-Powered Workflows (Non-Engineering)',
    description: 'Specialists who build AI-supported workflows using no-code/low-code tools, integrate with common apps like CRM, docs, and sheets, and create SOPs for measurable productivity gains.',
    capabilities: [
      'Builds AI-supported workflows using no-code/low-code platforms',
      'Integrates AI tools with common business apps (CRM, docs, sheets)',
      'Creates SOPs and documentation for AI-powered processes',
      'Measures and reports productivity improvements',
      'Designs automation solutions for recurring business challenges',
    ],
    suitableFor: 'Process improvement, operations optimization, and business systems roles.',
  },
  {
    level: 'L4' as const,
    name: 'AI Adoption Lead (Business)',
    tagline: 'Leading AI Adoption in Teams',
    description: 'Leaders who drive AI adoption across teams, define use cases, train others, set governance policies, and coordinate AI solution needs with vendors and consultants. They do not build models but enable others to leverage AI effectively.',
    capabilities: [
      'Leads AI adoption initiatives within teams and departments',
      'Defines and prioritizes AI use cases for business impact',
      'Trains and mentors team members on AI tools and workflows',
      'Sets governance policies for responsible AI usage',
      'Coordinates with vendors and consultants on AI solutions',
      'Measures and communicates business value from AI adoption',
    ],
    suitableFor: 'Team leads, department heads, and transformation roles driving workplace AI adoption.',
  },
];

export function AISkillFramework() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-muted/50 to-background py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-foreground mb-4">
              The AI Skill Framework
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A structured approach to workplace AI capabilities. 
              From awareness to adoption leadership — find the right skill level for your business needs.
            </p>
            <p className="text-sm text-muted-foreground mt-4 max-w-xl mx-auto">
              This framework focuses on <strong>AI-augmented business roles</strong> — professionals who use AI tools 
              to improve productivity, not engineers who build AI systems.
            </p>
          </div>
        </div>
      </section>

      {/* Framework Overview */}
      <section className="py-8 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {skillLevels.map((skill) => (
                <Card key={skill.level} className="text-center p-4 border-border/50">
                  <AISkillBadge level={skill.level} size="lg" />
                  <p className="mt-2 text-sm font-medium text-foreground">{skill.name}</p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Detailed Level Cards */}
      <section className="py-12 lg:py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-8">
            {skillLevels.map((skill) => (
              <Card key={skill.level} className="border-border/50 overflow-hidden">
                <CardHeader className="bg-muted/30">
                  <div className="flex items-center gap-4">
                    <AISkillBadge level={skill.level} size="lg" />
                    <div>
                      <CardTitle className="text-xl">{skill.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{skill.tagline}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <p className="text-muted-foreground mb-6">{skill.description}</p>
                  
                  <div className="mb-6">
                    <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      Key Capabilities
                    </h4>
                    <ul className="space-y-2">
                      {skill.capabilities.map((capability, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <span className="text-primary mt-1">•</span>
                          {capability}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="bg-muted/30 rounded-lg p-4">
                    <h4 className="font-medium text-foreground mb-1 flex items-center gap-2">
                      <Target className="h-4 w-4 text-primary" />
                      Suitable For
                    </h4>
                    <p className="text-sm text-muted-foreground">{skill.suitableFor}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Training Progression */}
      <section className="py-16 lg:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl lg:text-3xl font-semibold text-center text-foreground mb-4">
              Progression Through Training
            </h2>
            <p className="text-center text-muted-foreground mb-8">
              Candidates can advance through skill levels via AIHQ's training programmes, 
              often supported by government grants.
            </p>
            
            <Card className="border-border/50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-center gap-4 flex-wrap">
                  <AISkillBadge level="L1" size="default" />
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <AISkillBadge level="L2" size="default" />
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <AISkillBadge level="L3" size="default" />
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <AISkillBadge level="L4" size="default" />
                </div>
                <p className="text-center text-sm text-muted-foreground mt-6">
                  Training programmes are designed to help candidates progress to the next level. 
                  Duration and content vary based on the target skill level.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* For Employers */}
      <section className="py-16 lg:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl lg:text-3xl font-semibold text-center text-foreground mb-4">
              For Employers
            </h2>
            <p className="text-center text-muted-foreground mb-8">
              How to use the AI Skill Framework when requesting talent.
            </p>
            
            <div className="space-y-4">
              <Callout variant="info">
                <div className="flex items-start gap-3">
                  <Lightbulb className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium mb-1">Specify Your Requirements</p>
                    <p className="text-sm text-muted-foreground">
                      When submitting a role request, indicate the minimum AI skill level required. 
                      Our team will match candidates accordingly and may suggest appropriate training 
                      if candidates are close to your target level.
                    </p>
                  </div>
                </div>
              </Callout>
              
              <Callout variant="trust">
                <div className="flex items-start gap-3">
                  <Target className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium mb-1">Not Sure Which Level?</p>
                    <p className="text-sm">
                      Describe the workflow problems you want to solve and what you want the person to accomplish. 
                      AIHQ will recommend the appropriate skill level based on your requirements.
                    </p>
                  </div>
                </div>
              </Callout>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl lg:text-3xl font-semibold mb-4">
              Request Talent with Specific AI Skills
            </h2>
            <p className="text-primary-foreground/80 mb-8">
              Tell us what workflow challenges you need to solve, and we'll find candidates who match your requirements.
            </p>
            <Button asChild size="lg" variant="secondary" className="text-base">
              <Link to="/request-talent">
                Submit a Role Request
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
