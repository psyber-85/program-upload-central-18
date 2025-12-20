import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Shield, User } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth, demoUsers } from '@/lib/placement/AuthContext';
import { EMPLOYER_ROLES, AIHQ_ROLES } from '@/lib/placement/types';

export default function DemoLogin() {
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const employerUsers = demoUsers.filter((u) => EMPLOYER_ROLES.includes(u.role));
  const aihqUsers = demoUsers.filter((u) => AIHQ_ROLES.includes(u.role));

  const handleLogin = () => {
    if (!selectedUser) return;
    login(selectedUser);
    const user = demoUsers.find((u) => u.id === selectedUser);
    if (user && EMPLOYER_ROLES.includes(user.role)) {
      navigate('/employer');
    } else {
      navigate('/ops');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Demo Login</h1>
          <p className="text-muted-foreground">
            Select a demo account to explore the AIHQ Placement Portal
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Employer Accounts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Employer Accounts
              </CardTitle>
              <CardDescription>Access the employer portal</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {employerUsers.map((user) => (
                <button
                  key={user.id}
                  onClick={() => setSelectedUser(user.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    selectedUser === user.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <p className="font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {user.company_name} · {user.role.replace('_', ' ')}
                  </p>
                </button>
              ))}
            </CardContent>
          </Card>

          {/* AIHQ Accounts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                AIHQ Ops Accounts
              </CardTitle>
              <CardDescription>Access the ops cockpit</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {aihqUsers.map((user) => (
                <button
                  key={user.id}
                  onClick={() => setSelectedUser(user.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    selectedUser === user.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <p className="font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {user.role.replace(/_/g, ' ')}
                  </p>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 text-center">
          <Button onClick={handleLogin} disabled={!selectedUser} size="lg">
            Continue as {selectedUser ? demoUsers.find((u) => u.id === selectedUser)?.name : '...'}
          </Button>
        </div>
      </div>
    </div>
  );
}
