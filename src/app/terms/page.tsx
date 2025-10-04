
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';

export default function TermsOfUsePage() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto py-12 px-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold font-headline">Terms of Use</h1>
        <p className="text-muted-foreground">Last updated: July 29, 2024</p>
      </div>
      <Card>
        <CardContent className="prose dark:prose-invert prose-sm sm:prose-base prose-a:text-primary p-6 space-y-4 text-muted-foreground">
          <p>
            Welcome to DreamyDesk! These Terms of Use ("Terms") govern your access to and use of our website, services, and applications (collectively, the "Service"). Please read them carefully. By accessing or using the Service, you agree to be bound by these Terms.
          </p>
          
          <h2 className="text-xl font-bold text-foreground">1. Use of Our Service</h2>
          <p>
            DreamyDesk provides a curated collection of digital wallpapers for personal use. You agree to use our Service only for lawful purposes and in a way that does not infringe the rights of, restrict, or inhibit anyone else's use and enjoyment of the Service.
          </p>
           <ul className="list-disc pl-6">
                <li><strong>Personal Use License:</strong> Wallpapers downloaded from DreamyDesk are for your personal, non-commercial use only. You may use them as backgrounds on your personal digital devices.</li>
                <li><strong>Prohibited Use:</strong> You may not redistribute, sell, lease, or use any wallpaper for commercial purposes without obtaining explicit permission from the copyright holder. You may not use our Service to engage in any activity that is illegal, harmful, or fraudulent.</li>
            </ul>

          <h2 className="text-xl font-bold text-foreground">2. Accounts and Premium Subscriptions</h2>
          <p>
            You may create an account to access features like favorites and download history. If you purchase a DreamyDesk Premium subscription, you agree to pay the specified fees. Subscriptions are for a single user and are non-transferable. You may cancel your subscription at any time, but please note that fees are non-refundable.
          </p>
          
          <h2 className="text-xl font-bold text-foreground">3. Intellectual Property</h2>
          <p>
            The wallpapers on our Service are the property of their respective copyright holders. DreamyDesk owns the Service itself, including our branding, website design, and the arrangement of content. You are not granted any right or license with respect to our trademarks or other intellectual property.
          </p>

          <h2 className="text-xl font-bold text-foreground">4. Termination</h2>
          <p>
            We may terminate or suspend your account and access to the Service immediately, without prior notice or liability, if you breach these Terms. Upon termination, your right to use the Service will cease immediately.
          </p>

           <h2 className="text-xl font-bold text-foreground">5. Disclaimers and Limitation of Liability</h2>
          <p>
            The Service is provided on an "AS IS" and "AS AVAILABLE" basis. DreamyDesk does not warrant that the service will be uninterrupted, secure, or error-free. To the fullest extent permitted by law, DreamyDesk shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the Service.
          </p>
           <h2 className="text-xl font-bold text-foreground">6. Changes to Terms</h2>
          <p>
           We reserve the right to modify these Terms at any time. We will notify you of any changes by posting the new Terms on this page. Your continued use of the Service after any such change constitutes your acceptance of the new Terms.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
