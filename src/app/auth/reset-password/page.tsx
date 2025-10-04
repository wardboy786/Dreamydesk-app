
'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { handleConfirmPasswordReset, handleVerifyResetCode } from '@/services/auth-service';
import { Loader2, ShieldX } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { DreamyDeskLogo } from '@/components/layout/dreamy-desk-logo';

const formSchema = z.object({
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
  confirmPassword: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const oobCode = searchParams.get('oobCode');

  useEffect(() => {
    if (!oobCode) {
      setError("Invalid password reset link. The link is either missing a required parameter or has been corrupted.");
      setIsVerifying(false);
      return;
    }

    const verifyCode = async () => {
      const { error } = await handleVerifyResetCode(oobCode);
      if (error) {
        setError("Invalid or expired password reset link. Please request a new one.");
      }
      setIsVerifying(false);
    };

    verifyCode();
  }, [oobCode]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!oobCode) return;
    setIsLoading(true);
    
    const { error } = await handleConfirmPasswordReset(oobCode, values.password);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: "Failed to reset password. The link may have expired.",
      });
      setError("Failed to reset password. The link may have expired. Please try again.");
    } else {
      toast({
        title: 'Success!',
        description: 'Your password has been reset. You can now log in with your new password.',
      });
      router.push('/auth/login');
    }
    setIsLoading(false);
  };

  if (isVerifying) {
    return (
        <Card className="w-full max-w-md bg-card/80 backdrop-blur-sm">
            <CardHeader className="text-center">
                 <Skeleton className="h-14 w-14 rounded-full mx-auto mb-4" />
                 <Skeleton className="h-7 w-48 mx-auto" />
                 <Skeleton className="h-4 w-full max-w-xs mx-auto" />
            </CardHeader>
            <CardContent className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </CardContent>
        </Card>
    );
  }

  if (error) {
    return (
        <Card className="w-full max-w-md bg-card/80 backdrop-blur-sm">
             <CardHeader className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border-2 border-destructive/20 bg-destructive/10">
                    <ShieldX className="h-8 w-8 text-destructive" />
                </div>
                <CardTitle className="text-2xl font-bold">Invalid Link</CardTitle>
                <CardDescription>{error}</CardDescription>
            </CardHeader>
            <CardContent>
                 <Button asChild className="w-full">
                    <Link href="/auth/forgot-password">Request a New Link</Link>
                </Button>
            </CardContent>
        </Card>
    );
  }


  return (
    <Card className="w-full max-w-md bg-card/80 backdrop-blur-sm">
      <CardHeader className="text-center">
         <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border-2 border-primary/20 bg-primary/10">
          <DreamyDeskLogo className="h-12 w-12" />
        </div>
        <CardTitle className="text-2xl font-bold">Reset Your Password</CardTitle>
        <CardDescription>
          Create a new, strong password for your account.
        </CardDescription>
      </CardHeader>
      <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
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
               <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
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
                Set New Password
              </Button>
            </form>
          </Form>
      </CardContent>
    </Card>
  );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div />}>
            <ResetPasswordForm />
        </Suspense>
    )
}
