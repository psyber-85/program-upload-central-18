import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { usePlacementAuth } from '@/contexts/PlacementAuthContext';
import { companyRepo } from '@/lib/placement/client';
import type { EmployerCompany, PlacementUserRole } from '@/lib/placement/types';
import { Building2, Users, Settings } from 'lucide-react';

export function PlacementLogin() {
  const [selectedRole, setSelectedRole] = useState<PlacementUserRole | ''>('');
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [companies, setCompanies] = useState<EmployerCompany[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { login, session, isLoading: authLoading } = usePlacementAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const loadCompanies = async () => {
      const data = await companyRepo.getAll();
      setCompanies(data);
    };
    loadCompanies();
  }, []);

  useEffect(() => {
    if (!authLoading && session) {
      // Redirect based on role
      if (session.role === 'COMPANY_ADMIN' || session.role === 'HIRING_MANAGER') {
        navigate('/employer');
      } else {
        navigate('/ops');
      }
    }
  }, [session, authLoading, navigate]);

  const isEmployerRole = selectedRole === 'COMPANY_ADMIN' || selectedRole === 'HIRING_MANAGER';

  const handleLogin = async () => {
    if (!selectedRole) return;
    if (isEmployerRole && !selectedCompany) return;

    setIsLoading(true);
    const demoEmail = selectedRole === 'AIHQ_OPS' 
      ? 'ops1@aihq.sg' 
      : selectedRole === 'AIHQ_ADMIN'
      ? 'admin@aihq.sg'
      : 'demo@employer.sg';

    const success = await login(demoEmail, selectedRole, isEmployerRole ? selectedCompany : undefined);
    
    if (success) {
      if (isEmployerRole) {
        navigate('/employer');
      } else {
        navigate('/ops');
      }
    }
    setIsLoading(false);
  };

  const roleOptions = [
    { value: 'COMPANY_ADMIN', label: 'Employer Admin', icon: Building2, description: 'Full access to company roles and settings' },
    { value: 'HIRING_MANAGER', label: 'Hiring Manager', icon: Users, description: 'Manage assigned roles and candidates' },
    { value: 'AIHQ_OPS', label: 'AIHQ Operations', icon: Settings, description: 'Manage placements and candidates' },
    { value: 'AIHQ_ADMIN', label: 'AIHQ Admin', icon: Settings, description: 'Full system access' },
  ];

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-lg bg-primary flex items-center justify-center mb-4">
            <span className="text-lg font-bold text-primary-foreground">AI</span>
          </div>
          <CardTitle className="text-2xl">AIHQ Placement Portal</CardTitle>
          <CardDescription>
            Demo login - Select a role to explore the system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Select Role</Label>
            <Select value={selectedRole} onValueChange={(v) => setSelectedRole(v as PlacementUserRole)}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a role to demo" />
              </SelectTrigger>
              <SelectContent>
                {roleOptions.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    <div className="flex items-center gap-2">
                      <role.icon className="h-4 w-4" />
                      <span>{role.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedRole && (
              <p className="text-xs text-muted-foreground mt-1">
                {roleOptions.find(r => r.value === selectedRole)?.description}
              </p>
            )}
          </div>

          {isEmployerRole && (
            <div className="space-y-2">
              <Label>Select Company</Label>
              <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a company" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <Button 
            className="w-full" 
            size="lg"
            onClick={handleLogin}
            disabled={!selectedRole || (isEmployerRole && !selectedCompany) || isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>

          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              This is a demo environment. No real authentication required.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
