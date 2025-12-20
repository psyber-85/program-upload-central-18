import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AISkillBadge, Callout } from '@/components/placement/ui';
import { ArrowRight, CheckCircle, Lightbulb, Target } from 'lucide-react';

const skillLevels = [
  {
    level: 'L1' as const,
    name: 'AI Aware',
    tagline: 'Understanding AI Fundamentals',
    description: 'Professionals at this level have a foundational understanding of AI concepts and can use simple AI-powered tools effectively.',
    capabilities: [
      'Understands basic AI terminology and concepts',
      'Can use AI-powered productivity tools (e.g., Grammarly, smart assistants)',
      'Recognizes opportunities where AI could add value',
      'Aware of AI ethics and responsible use principles',
    ],
    suitableFor: 'Roles requiring general AI literacy and tool adoption across departments.',
  },
  {
    level: 'L2' as const,
    name: 'AI User',
    tagline: 'Proficient Daily AI Usage',
    description: 'These professionals actively use AI tools as part of their daily workflow and understand prompt engineering basics.',
    capabilities: [
      'Proficient with ChatGPT, Copilot, and similar tools',
      'Understands prompt engineering fundamentals',
      'Can evaluate AI outputs for accuracy and relevance',
      'Integrates AI tools into existing workflows effectively',
      'Trains colleagues on basic AI tool usage',
    ],
    suitableFor: 'Knowledge workers, analysts, content creators, and customer-facing roles.',
  },
  {
    level: 'L3' as const,
    name: 'AI Builder',
    tagline: 'Building & Customizing AI Solutions',
    description: 'Technical professionals who can build, customize, and deploy AI-powered solutions for business problems.',
    capabilities: [
      'Builds custom AI workflows and automations',
      'Integrates AI APIs into applications',
      'Fine-tunes and customizes AI models for specific use cases',
      'Develops internal AI tools and prototypes',
      'Manages AI project implementation end-to-end',
    ],
    suitableFor: 'Technical roles, product teams, operations, and innovation-focused positions.',
  },
  {
    level: 'L4' as const,
    name: 'AI Architect',
    tagline: 'Strategic AI Leadership',
    description: 'Expert-level professionals who design AI systems, set organizational AI strategy, and lead AI transformation initiatives.',
    capabilities: [
      'Designs scalable AI system architectures',
      'Develops organizational AI strategy and roadmaps',
      'Leads and mentors AI teams',
      'Evaluates and selects AI technologies and vendors',
      'Ensures AI governance, compliance, and ethics',
      'Drives AI adoption across the organization',
    ],
    suitableFor: 'Leadership roles, CTO/CDO offices, and strategic transformation initiatives.',
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
              A structured approach to understanding and specifying AI capabilities. 
              From awareness to architecture, find the right skill level for your needs.
            </p>
          </div>
        </div>
      </section>

      {/* Framework Overview */}
      <section className="py-8 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-4 gap-4 mb-8">
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
                      Describe the role and what you want the person to accomplish with AI. 
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
              Tell us what AI capabilities you need, and we'll find candidates who match your requirements.
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
