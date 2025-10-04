
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Gem, Star, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { InAppPurchase, Product } from 'capacitor-plugin-in-app-purchase';
import { Capacitor } from '@capacitor/core';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { format } from 'date-fns';

const freeFeatures = [
    "Access to a vast library of free wallpapers",
    "Standard resolution downloads",
    "Ad-supported experience",
];

const premiumFeatures = [
    "Access to exclusive premium wallpapers",
    "Highest resolution downloads available",
    "Completely ad-free experience",
    "Early access to new collections",
    "Priority support",
];

// Define your product ID from Google Play Console
const MONTHLY_PLAN_ID = 'your_monthly_plan_id_here';

export default function PremiumPage() {
    const { user, isPremium, premiumUntil, loading: authLoading } = useAuth();
    const { toast } = useToast();
    const [product, setProduct] = useState<Product | null>(null);
    const [loadingProduct, setLoadingProduct] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const isNative = Capacitor.isNativePlatform();

    useEffect(() => {
        if (!isNative) {
            setLoadingProduct(false);
            return;
        }
        
        async function loadProducts() {
            try {
                // Initialize the billing service
                await InAppPurchase.initialize();
                
                // Get product details
                const { products } = await InAppPurchase.getProducts({ productIds: [MONTHLY_PLAN_ID] });
                if (products.length > 0) {
                    setProduct(products[0]);
                }
            } catch (error: any) {
                console.error("Failed to load products", error);
                toast({ variant: 'destructive', title: 'Error', description: 'Could not load subscription options.' });
            } finally {
                setLoadingProduct(false);
            }
        }
        
        loadProducts();

    }, [isNative, toast]);

    const handleUpgrade = async () => {
        if (!user) {
            toast({ variant: 'destructive', title: 'Not Logged In', description: 'You must be logged in to subscribe.'});
            return;
        }
        if (!product) {
            toast({ variant: 'destructive', title: 'Pricing Error', description: 'Could not find the subscription product. Please try again.'});
            return;
        }

        setIsProcessing(true);
        try {
            await InAppPurchase.purchase({ productId: product.productId });
            // The actual entitlement should be granted via a server-side webhook from Google Play
            // and a listener for purchase success on the client.
            // For now, we show a success message.
            toast({ title: 'Purchase Initiated', description: 'Follow the on-screen instructions to complete your purchase.' });
        } catch (error: any) {
             toast({ variant: 'destructive', title: 'Purchase Error', description: error.message || 'The purchase could not be completed.' });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleCancelSubscription = async () => {
       // On Android, users manage subscriptions directly from the Google Play Store.
       // We can only redirect them there.
       const playStoreUrl = `https://play.google.com/store/account/subscriptions`;
       window.open(playStoreUrl, '_blank');
       toast({ title: 'Manage Subscription', description: 'You are being redirected to the Google Play Store to manage your subscriptions.' });
    };
    
    return (
        <div className="space-y-12">
            <Link href="/menu" className={cn(buttonVariants({ variant: 'ghost' }), "pl-0")}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Menu
            </Link>

            <div className="text-center space-y-4">
                <Gem className="w-16 h-16 mx-auto text-primary animate-pulse" />
                <h1 className="text-4xl md:text-5xl font-bold font-headline">
                    {isPremium ? 'You are a Premium Member!' : 'Unlock Your Dream Desk'}
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                     {isPremium 
                        ? 'Thank you for your support. Enjoy all the exclusive benefits!' 
                        : 'Upgrade to DreamyDesk Premium with a monthly subscription for exclusive content and zero ads.'}
                </p>
                 {isPremium && premiumUntil && (
                    <p className="text-sm text-muted-foreground">
                        Your subscription is managed in the Google Play Store. Next payment due: {format(premiumUntil, "PPP")}.
                    </p>
                 )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                <Card className="flex flex-col">
                    <CardHeader>
                        <CardTitle className="text-2xl font-headline">Free</CardTitle>
                        <CardDescription>Our standard offering, ad-supported.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow space-y-4">
                        <p className="text-3xl font-bold">
                            $0
                        </p>
                        <ul className="space-y-2">
                            {freeFeatures.map(feature => (
                                <li key={feature} className="flex items-center gap-3">
                                    <Check className="w-5 h-5 text-green-500" />
                                    <span className="text-muted-foreground">{feature}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                    <div className="p-6 pt-0">
                         <Button variant="outline" className="w-full" disabled={true}>
                            Your Current Plan
                        </Button>
                    </div>
                </Card>

                <Card className="flex flex-col border-2 border-primary shadow-lg shadow-primary/20 relative overflow-hidden">
                     <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-4 py-1 rounded-bl-lg flex items-center gap-1">
                        <Star className="w-4 h-4" /> MOST POPULAR
                    </div>
                    <CardHeader>
                        <CardTitle className="text-2xl font-headline">Premium</CardTitle>
                        <CardDescription>Billed monthly, cancel anytime via Google Play.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow space-y-4">
                        {loadingProduct || authLoading ? (
                             <Skeleton className="h-10 w-32" />
                        ) : (
                            <p className="text-3xl font-bold">
                                {product ? product.price : 'Not Available'}
                            </p>
                        )}
                        <ul className="space-y-2">
                             {premiumFeatures.map(feature => (
                                <li key={feature} className="flex items-center gap-3">
                                    <Check className="w-5 h-5 text-primary" />
                                    <span>{feature}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                    <div className="p-6 pt-0 space-y-2">
                        {isPremium ? (
                            <Button variant="outline" className="w-full text-lg py-6" onClick={handleCancelSubscription}>
                                Manage Subscription
                            </Button>
                        ) : (
                             <Button className="w-full text-lg py-6" onClick={handleUpgrade} disabled={loadingProduct || authLoading || isProcessing || !product || !isNative}>
                                {isProcessing || loadingProduct ? <Loader2 className="mr-2 animate-spin" /> : <Gem className="mr-2" />}
                                {isNative ? 'Upgrade Now' : 'Available in App'}
                            </Button>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
}
