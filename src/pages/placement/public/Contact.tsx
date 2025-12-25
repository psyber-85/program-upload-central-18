import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Contact() {
  const contactInfo = [
    {
      icon: Mail,
      title: 'Email',
      value: 'placement@aihq.sg',
      href: 'mailto:placement@aihq.sg',
    },
    {
      icon: Phone,
      title: 'Phone',
      value: '+65 6123 4567',
      href: 'tel:+6561234567',
    },
    {
      icon: MapPin,
      title: 'Address',
      value: 'Singapore',
      href: undefined,
    },
    {
      icon: Clock,
      title: 'Office Hours',
      value: 'Mon-Fri, 9am-6pm SGT',
      href: undefined,
    },
  ];

  return (
    <div className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Contact Us</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Have questions about our placement services? We're here to help.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {contactInfo.map((item) => (
              <Card key={item.title}>
                <CardContent className="flex items-start gap-4 pt-6">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">{item.title}</h3>
                    {item.href ? (
                      <a 
                        href={item.href} 
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        {item.value}
                      </a>
                    ) : (
                      <p className="text-muted-foreground">{item.value}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-muted/30">
            <CardHeader>
              <CardTitle>Looking to Hire?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                If you're an employer looking to hire trained talent, the fastest way 
                to get started is to submit a talent request. Our team will be in touch 
                within 1 business day.
              </p>
              <Button asChild>
                <Link to="/request-talent">Submit a Talent Request</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Already a Partner?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                If you're an existing employer partner, sign in to your portal to 
                manage your roles and view candidates.
              </p>
              <Button variant="outline" asChild>
                <Link to="/login">Sign In to Employer Portal</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
