
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Heart, Server, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';

export default function SupportPage() {
    return (
        <div className="space-y-12">
            <Link href="/menu" className={cn(buttonVariants({ variant: 'ghost' }), "pl-0")}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Menu
            </Link>

            <div className="text-center space-y-4">
                <div className="inline-block bg-primary/10 p-4 rounded-full">
                    <Heart className="w-16 h-16 text-primary animate-pulse" />
                </div>
                <h1 className="text-4xl md:text-5xl font-bold font-headline">
                    Fuel Our Creative Engine
                </h1>
                <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                    Every stunning wallpaper on DreamyDesk is a labor of love, crafted with passion and an eye for detail. But behind every pixel-perfect image, there's a story of effort, resources, and dedication.
                </p>
            </div>
            
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="flex flex-col text-center">
                    <CardHeader>
                        <ImageIcon className="w-10 h-10 mx-auto text-primary" />
                        <CardTitle className="text-2xl font-headline mt-2">Crafting 4K Art</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow">
                        <p className="text-muted-foreground">
                            Creating and sourcing true 4K wallpapers requires significant time and specialized tools. Your support helps us partner with talented artists and invest in the technology to bring these vibrant worlds to your screen.
                        </p>
                    </CardContent>
                </Card>
                <Card className="flex flex-col text-center">
                    <CardHeader>
                        <Server className="w-10 h-10 mx-auto text-primary" />
                        <CardTitle className="text-2xl font-headline mt-2">Powerful Servers</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow">
                        <p className="text-muted-foreground">
                            Delivering millions of high-resolution images instantly across the globe requires a robust and costly server infrastructure. Your contribution keeps our servers fast, reliable, and always on for you.
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Card className="max-w-3xl mx-auto text-center bg-secondary/50">
                <CardHeader>
                    <CardTitle className="font-headline text-3xl">Become a DreamyDesk Patron</CardTitle>
                    <CardDescription className="max-w-2xl mx-auto pt-2">
                        If DreamyDesk brings a little bit of joy or inspiration to your day, consider supporting our mission. Every contribution, big or small, empowers us to keep this dream alive, ad-free for premium users, and constantly growing.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                     <a 
                        href="https://razorpay.me/@dreamydesk" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className={cn(buttonVariants({ size: 'lg' }), "relative group text-lg py-6 px-8 transition-transform duration-300 ease-in-out hover:scale-105 animate-pulse hover:animate-none")}
                    >
                        <span className="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary rounded-md opacity-75 group-hover:opacity-100 transition-opacity duration-300"></span>
                        <span className="relative flex items-center">
                             <Heart className="mr-2 h-5 w-5 fill-current" />
                            Support Us
                        </span>
                    </a>
                    <p className="text-xs text-muted-foreground mt-4">You will be redirected to Razorpay, our secure payment partner.</p>
                </CardContent>
            </Card>
        </div>
    );
}
