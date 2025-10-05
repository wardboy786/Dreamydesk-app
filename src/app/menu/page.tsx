
"use client";

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronRight, User, ShieldCheck, Heart, Sparkles, LogOut, LogIn, Gem, HandCoins, ArrowLeft, Newspaper } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { useAuth } from '@/hooks/use-auth';
import { handleSignOut } from '@/services/auth-service';
import { useRouter } from 'next/navigation';
import { Button, buttonVariants } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';


const legalItems = [
  { name: 'About Us', href: '/menu/about' },
  { name: 'Contact Us', href: '/menu/contact' },
  { name: 'Privacy Policy', href: '/privacy' },
  { name: 'Terms of Use', href: '/menu/terms' },
  { name: 'DMCA / Copyright', href: '/menu/dmca' },
];

export default function MenuPage() {
    const { user, loading, isPremium } = useAuth();
    const router = useRouter();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const onSignOut = async () => {
        await handleSignOut();
        router.push('/');
    }

    if (!isClient || loading) {
        return <MenuPageSkeleton />;
    }

  return (
    <div className="space-y-8">
      <Link href="/" className={cn(buttonVariants({ variant: 'ghost' }), "pl-0")}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Home
      </Link>
      <div className="text-center">
        <h1 className="text-4xl font-bold font-headline">Menu</h1>
        <p className="text-muted-foreground">Manage your account and app information.</p>
      </div>
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-0">
          <ul className="divide-y divide-border">
            {user ? (
                 <li>
                    <Link href="/menu/profile">
                        <div className="flex items-center p-4 hover:bg-accent transition-colors">
                            <Avatar className="w-10 h-10 mr-4">
                                <AvatarImage src={user.photoURL || `https://api.dicebear.com/8.x/bottts-neutral/svg?seed=${user.uid}`} alt={user.displayName || "User"}/>
                                <AvatarFallback>{user.displayName?.charAt(0) || 'U'}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <span className="font-medium">{user.displayName || "Profile"}</span>
                                <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                            <ChevronRight className="w-5 h-5 text-muted-foreground" />
                        </div>
                    </Link>
                </li>
            ) : (
                <li>
                    <Link href="/auth/login">
                        <div className="flex items-center p-4 hover:bg-accent transition-colors">
                            <div className="w-10 h-10 mr-4 flex items-center justify-center">
                                <LogIn className="w-6 h-6 text-muted-foreground" />
                            </div>
                            <div className="flex-1">
                                <span className="font-medium">Login or Sign Up</span>
                                 <p className="text-sm text-muted-foreground">Save favorites and more</p>
                            </div>
                            <ChevronRight className="w-5 h-5 text-muted-foreground" />
                        </div>
                    </Link>
                </li>
            )}
            <li>
                <Link href="/menu/premium">
                    <div className="flex items-center p-4 hover:bg-accent transition-colors">
                        <div className="w-10 h-10 mr-4 flex items-center justify-center">
                            <Gem className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1">
                            <span className="font-medium">Go Premium</span>
                            <p className="text-sm text-muted-foreground">Ad-free, unlimited downloads, and more</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </div>
                </Link>
            </li>
             <li>
                <Link href="/menu/support">
                    <div className="flex items-center p-4 hover:bg-accent transition-colors">
                        <div className="w-10 h-10 mr-4 flex items-center justify-center">
                            <HandCoins className="w-6 h-6 text-green-500" />
                        </div>
                        <div className="flex-1">
                            <span className="font-medium">Support Us</span>
                            <p className="text-sm text-muted-foreground">Help us keep DreamyDesk running</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </div>
                </Link>
            </li>
            <li>
                <Link href="/menu/request">
                    <div className="flex items-center p-4 hover:bg-accent transition-colors">
                        <div className="w-10 h-10 mr-4 flex items-center justify-center">
                            <Sparkles className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                            <span className="font-medium">Request a Wallpaper</span>
                            <p className="text-sm text-muted-foreground">Tell us what you'd like to see next</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </div>
                </Link>
            </li>
            <li className="p-2">
                 <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1" className="border-b-0">
                        <AccordionTrigger className="p-2 hover:bg-accent rounded-md">
                             <div className="flex items-center">
                                <div className="w-10 h-10 mr-2 flex items-center justify-center">
                                    <ShieldCheck className="w-6 h-6 text-muted-foreground" />
                                </div>
                                <span className="flex-1 font-medium text-left">Legal & Info</span>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent>
                           <ul className="pt-2">
                             {legalItems.map((item) => (
                                <li key={item.name}>
                                    <Link href={item.href}>
                                    <div className="flex items-center p-3 pl-14 rounded-md hover:bg-accent transition-colors">
                                        <span className="flex-1 font-medium text-sm text-muted-foreground">{item.name}</span>
                                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                    </div>
                                    </Link>
                                </li>
                                ))}
                           </ul>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </li>
            {user && (
                <li>
                    <button onClick={onSignOut} className="w-full text-left">
                        <div className="flex items-center p-4 hover:bg-accent transition-colors text-destructive">
                            <div className="w-10 h-10 mr-4 flex items-center justify-center">
                                <LogOut className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                                <span className="font-medium">Logout</span>
                            </div>
                        </div>
                    </button>
                </li>
            )}
          </ul>
        </CardContent>
      </Card>

      <div className="text-center text-sm text-muted-foreground flex items-center justify-center gap-1.5">
          Made with <Heart className="w-4 h-4 text-red-500" /> by DreamyDesk
      </div>
      

    </div>
  );
}

function MenuPageSkeleton() {
    return (
        <div className="space-y-8 animate-pulse">
            <div className="text-center">
                <Skeleton className="h-10 w-48 mx-auto" />
                <Skeleton className="h-4 w-64 mx-auto mt-2" />
            </div>
            <Card className="max-w-2xl mx-auto">
                <CardContent className="p-0">
                    <ul className="divide-y divide-border">
                        {[...Array(5)].map((_, i) => (
                            <li key={i} className="p-4">
                                <div className="flex items-center">
                                    <Skeleton className="w-10 h-10 rounded-full mr-4" />
                                    <div className="flex-1 space-y-2">
                                        <Skeleton className="h-4 w-1/2" />
                                        <Skeleton className="h-3 w-3/4" />
                                    </div>
                                    <Skeleton className="w-5 h-5" />
                                </div>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
        </div>
    )
}
