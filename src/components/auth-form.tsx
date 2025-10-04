
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import {
  handleGoogleSignIn,
  handleEmailPasswordSignUp,
  handleEmailPasswordSignIn,
} from '@/services/auth-service';
import { Loader2 } from 'lucide-react';
import { GoogleIcon } from './google-icon';
import { DreamyDeskLogo } from './layout/dreamy-desk-logo';

interface AuthFormProps {
  mode: 'login' | 'signup';
}

const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters.' }),
});

const signupSchema = z.object({
  displayName: z.string().min(3, { message: 'Display name must be at least 3 characters.'}),
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters.' }),
});

export default function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const formSchema = mode === 'login' ? loginSchema : signupSchema;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      ...(mode === 'signup' && { displayName: '' }),
    },
  });

  const onGoogleSignIn = async () => {
    setIsLoading(true);
    const { error } = await handleGoogleSignIn();
    if (error) {
      toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: error.message,
      });
      setIsLoading(false);
    } else {
      toast({ title: 'Success', description: 'Logged in successfully!' });
      router.push('/');
      router.refresh(); // Refresh to update header state
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    let error;

    if (mode === 'signup') {
      const signupValues = values as z.infer<typeof signupSchema>;
      ({ error } = await handleEmailPasswordSignUp(
        signupValues.email,
        signupValues.password,
        signupValues.displayName
      ));
    } else {
       const loginValues = values as z.infer<typeof loginSchema>;
      ({ error } = await handleEmailPasswordSignIn(
        loginValues.email,
        loginValues.password
      ));
    }

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: error.message,
      });
    } else {
      toast({
        title: 'Success',
        description:
          mode === 'login' ? 'Logged in successfully!' : 'Account created!',
      });
      router.push('/');
      router.refresh();
    }
    setIsLoading(false);
  };

  return (
    <Card className="w-full max-w-md bg-card/80 backdrop-blur-sm">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border-2 border-primary/20 bg-primary/10">
          <DreamyDeskLogo className="h-12 w-12" />
        </div>
        <CardTitle className="text-2xl font-bold">
          {mode === 'login' ? 'Welcome back' : 'Create an account'}
        </CardTitle>
        <CardDescription>
          {mode === 'login'
            ? 'Please enter your details to sign in'
            : 'Enter your details to get started'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={onGoogleSignIn}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <GoogleIcon className="mr-2 h-4 w-4" />
            )}
            Sign in with Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {mode === 'signup' && (
                  <FormField
                    control={form.control}
                    name="displayName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Display Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter your name"
                            {...field}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
              )}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email address</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your email"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Password</FormLabel>
                      {mode === 'login' && (
                        <Link
                          href="/auth/forgot-password"
                          className="text-sm font-medium text-primary hover:underline"
                        >
                          Forgot password?
                        </Link>
                      )}
                    </div>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {mode === 'login' ? 'Sign In' : 'Sign Up'}
              </Button>
            </form>
          </Form>
        </div>

        <div className="mt-6 text-center text-sm">
          {mode === 'login' ? (
            <>
              Don't have an account?{' '}
              <Link
                href="/auth/signup"
                className="font-medium text-primary hover:underline"
              >
                Create account
              </Link>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <Link
                href="/auth/login"
                className="font-medium text-primary hover:underline"
              >
                Sign in
              </Link>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
