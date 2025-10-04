
'use client';

import { useState } from 'react';
import Link from 'next/link';
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
import { handlePasswordResetRequest } from '@/services/auth-service';
import { Loader2, ArrowLeft } from 'lucide-react';
import { DreamyDeskLogo } from '@/components/layout/dreamy-desk-logo';

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email.' }),
});

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    const { error } = await handlePasswordResetRequest(values.email);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.code === 'auth/user-not-found' 
            ? 'No user found with this email address.' 
            : error.message,
      });
    } else {
      setIsSuccess(true);
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
          {isSuccess ? 'Check Your Email' : 'Forgot Password'}
        </CardTitle>
        <CardDescription>
          {isSuccess
            ? `We've sent a password reset link to ${form.getValues('email')}. Please follow the instructions in the email.`
            : 'No problem. Enter your email address and we will send you a link to reset your password.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!isSuccess ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send Reset Link
              </Button>
            </form>
          </Form>
        ) : (
          <Button asChild className="w-full">
            <Link href="/auth/login">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Login
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
