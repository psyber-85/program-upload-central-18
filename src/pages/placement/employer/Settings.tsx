import { Link } from 'react-router-dom';
import { Building2, User, Mail, Phone, MapPin, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Callout } from '@/components/placement/ui';
import { useAuth } from '@/lib/placement/AuthContext';
import { mockCompanies, mockEmployerUsers } from '@/lib/placement/mockData';

const sizeBandLabels = {
  startup: 'Startup (1-50)',
  sme: 'SME (51-250)',
  enterprise: 'Enterprise (250+)',
};

export function Settings() {
  const { user } = useAuth();
  const companyId = user?.company_id;

  // Get company info
  const company = mockCompanies.find((c) => c.id === companyId);
  
  // Get users for this company
  const companyUsers = mockEmployerUsers.filter((u) => u.company_id === companyId);

  if (!company) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-2">Company not found</h2>
        <p className="text-muted-foreground">Unable to load company information.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">
          View your company information and team members
        </p>
      </div>

      {/* Company Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <CardTitle>Company Information</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Company Name</p>
              <p className="font-medium">{company.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Industry</p>
              <p className="font-medium">{company.industry}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Company Size</p>
              <p className="font-medium">{sizeBandLabels[company.size_band]}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Location</p>
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{company.location}</span>
              </div>
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Need to update your company information?
            </p>
            <Link 
              to="/contact" 
              className="text-sm text-primary hover:underline"
            >
              Contact AIHQ
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Team Members */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <CardTitle>Team Members</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {companyUsers.map((member) => (
              <div 
                key={member.id} 
                className="flex items-start justify-between p-4 bg-muted/50 rounded-lg"
              >
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-background flex items-center justify-center border">
                    <User className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">{member.name}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <Mail className="h-3 w-3" />
                      <span>{member.email}</span>
                    </div>
                    {member.phone && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <Phone className="h-3 w-3" />
                        <span>{member.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
                <Badge variant={member.role === 'employer_owner' ? 'default' : 'secondary'}>
                  {member.role === 'employer_owner' ? 'Owner' : 'HR'}
                </Badge>
              </div>
            ))}
          </div>

          <Separator className="my-4" />

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Need to add or remove team members?
            </p>
            <Link 
              to="/contact" 
              className="text-sm text-primary hover:underline"
            >
              Contact AIHQ
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Account Info */}
      <Card>
        <CardHeader>
          <CardTitle>Your Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="font-medium">{user?.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{user?.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Role</p>
              <Badge variant="outline">
                {user?.role === 'employer_owner' ? 'Owner' : 'HR'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Callout */}
      <Callout variant="info" title="Need Help?">
        For any changes to your account or company information, please contact AIHQ. We're here to help.
      </Callout>
    </div>
  );
}
