import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, LogIn, Info } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate('/staff', { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }
    
    setIsSubmitting(true);
    
    const result = await login(email, password);
    
    if (result.success) {
      navigate('/staff', { replace: true });
    } else {
      setError(result.error || 'Login failed');
    }
    
    setIsSubmitting(false);
  };

  const handleDemoLogin = async (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('demo');
    setError('');
    setIsSubmitting(true);
    
    const result = await login(demoEmail, 'demo');
    
    if (result.success) {
      navigate('/staff', { replace: true });
    } else {
      setError(result.error || 'Login failed');
    }
    
    setIsSubmitting(false);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground">AIHQ Staff Portal</h1>
          <p className="text-muted-foreground mt-2">Sign in to access the portal</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Welcome back</CardTitle>
            <CardDescription>Enter your credentials to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@theaihq.net"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                  autoComplete="email"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter any password (demo)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting}
                  autoComplete="current-password"
                />
              </div>
              
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    Sign In
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Demo accounts */}
        <Card className="border-dashed">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-sm font-medium">Demo Accounts</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button 
              variant="outline" 
              className="w-full justify-start text-left"
              onClick={() => handleDemoLogin('ahmad@theaihq.net')}
              disabled={isSubmitting}
            >
              <div className="flex flex-col items-start">
                <span className="font-medium">Ahmad Rizal</span>
                <span className="text-xs text-muted-foreground">ahmad@theaihq.net · Admin</span>
              </div>
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start text-left"
              onClick={() => handleDemoLogin('siti@theaihq.net')}
              disabled={isSubmitting}
            >
              <div className="flex flex-col items-start">
                <span className="font-medium">Siti Nurhaliza</span>
                <span className="text-xs text-muted-foreground">siti@theaihq.net · Staff</span>
              </div>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
