
"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { DreamyDeskLogo } from '../layout/dreamy-desk-logo';
import { useToast } from '@/hooks/use-toast';
import { handleEmailPasswordSignIn } from '@/services/auth-service';

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await handleEmailPasswordSignIn(email, password);

    if (error) {
        toast({ 
            variant: 'destructive', 
            title: "Login Failed", 
            description: error.message || "Invalid credentials. Please try again." 
        });
    } else {
        toast({ title: "Login Successful", description: "Welcome back!" });
        // The layout will automatically react to the auth state change.
    }
    
    setLoading(false);
  };

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-muted/40 px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
           <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border-2 border-primary/20 bg-primary/10">
                <DreamyDeskLogo className="h-12 w-12" />
            </div>
          <CardTitle className="text-2xl font-bold">Admin Login</CardTitle>
          <CardDescription>Enter your credentials to access the dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign In
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
