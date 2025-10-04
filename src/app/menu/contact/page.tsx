
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { ArrowLeft, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';

export default function ContactPage() {
  return (
    <div className="space-y-8">
      <Link href="/menu" className={cn(buttonVariants({ variant: 'ghost' }), "pl-0")}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Menu
      </Link>
      <div className="text-center">
        <h1 className="text-4xl font-bold font-headline">Contact Us</h1>
        <p className="text-muted-foreground">We'd love to hear from you. Drop us a line.</p>
      </div>
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Get in Touch</CardTitle>
          <CardDescription>
            Have a question, a suggestion, or a partnership inquiry? The best way to reach us is by email. We'll do our best to get back to you within 48 hours.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <a href="mailto:info@dreamydesk.co.in" className={cn(buttonVariants({ size: 'lg' }))}>
            <Mail className="mr-2 h-5 w-5" /> info@dreamydesk.co.in
          </a>
          <p className="text-xs text-muted-foreground mt-4">
            For copyright-related inquiries, please refer to our <Link href="/menu/dmca" className="underline hover:text-primary">DMCA Policy</Link> page for specific instructions.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
