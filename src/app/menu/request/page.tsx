
"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { ArrowLeft, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';

export default function RequestPage() {
  const [request, setRequest] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!request.trim()) return;

    const subject = encodeURIComponent("New Wallpaper Request");
    const body = encodeURIComponent(`A user has requested a new wallpaper with the following description:\n\n---\n\n${request}\n\n---`);
    window.location.href = `mailto:ecoliwears@gmail.com?subject=${subject}&body=${body}`;
  };

  return (
    <div className="space-y-8">
      <Link href="/menu" className={cn(buttonVariants({ variant: 'ghost' }), "pl-0")}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Menu
      </Link>
      <div className="text-center">
        <h1 className="text-4xl font-bold font-headline">Request a Wallpaper</h1>
        <p className="text-muted-foreground">Have an idea? Let us know what you want to see next!</p>
      </div>
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Your Wallpaper Idea</CardTitle>
          <CardDescription>
            Describe the wallpaper you're imagining. Think about the subject, style, colors, and mood. This will open your default email client. If you have an inspiration image, please attach it to the email.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="request">Description</Label>
              <Textarea 
                id="request" 
                placeholder="e.g., A minimalist, dark-themed wallpaper of a lone astronaut looking at a colorful nebula..." 
                className="min-h-[150px]"
                value={request}
                onChange={(e) => setRequest(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={!request.trim()}>
              <Send className="mr-2 h-4 w-4" />
              Submit Request via Email
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
