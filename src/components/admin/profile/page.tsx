
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Heart, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { getLikedWallpapers, getDownloadedWallpapers } from "@/services/user-service";
import { Wallpaper } from "@/lib/types";
import { Button } from "@/components/ui/button";
import OptimizedImage from "@/components/optimized-image";
import { AspectRatio } from "@/components/ui/aspect-ratio";


function WallpaperPreviewGrid({ title, wallpapers, viewMoreLink, icon: Icon, iconColor }: { title: string, wallpapers: Wallpaper[], viewMoreLink: string, icon: React.ElementType, iconColor: string }) {
    if (wallpapers.length === 0) {
        return (
             <div className="text-center py-12 border-2 border-dashed rounded-lg">
                <Icon className={cn("w-12 h-12 mx-auto text-muted-foreground/50", iconColor)} />
                <p className="mt-4 text-muted-foreground">You haven't {title === 'Favorites' ? 'liked' : 'downloaded'} any wallpapers yet.</p>
                <Link href="/" className={cn(buttonVariants({variant: "link"}), "mt-2")}>Browse Wallpapers</Link>
            </div>
        );
    }
    
    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                 <h2 className="text-2xl font-bold font-headline flex items-center gap-2">
                    <Icon className={cn("w-6 h-6", iconColor)}/>
                    {title}
                </h2>
                {wallpapers.length > 4 && (
                    <Button asChild variant="secondary" size="sm">
                        <Link href={viewMoreLink}>Show More</Link>
                    </Button>
                )}
            </div>
             <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {wallpapers.slice(0, 4).map(wallpaper => (
                    <Link href={`/wallpaper/${wallpaper.id}`} key={wallpaper.id}>
                        <Card className="overflow-hidden group transition-all duration-300 hover:shadow-lg">
                           <AspectRatio ratio={9 / 16} className="bg-muted">
                               <OptimizedImage
                                   src={wallpaper.thumbnailUrl || wallpaper.imageUrl}
                                   alt={wallpaper.title}
                                   fill
                                   className="object-cover transition-transform duration-300 group-hover:scale-105"
                                   sizes="(max-width: 640px) 50vw, 25vw"
                               />
                           </AspectRatio>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    )
}


export default function ProfilePage() {
    const { user, loading } = useAuth();
    const [likedWallpapers, setLikedWallpapers] = useState<Wallpaper[]>([]);
    const [downloadedWallpapers, setDownloadedWallpapers] = useState<Wallpaper[]>([]);
    const [loadingWallpapers, setLoadingWallpapers] = useState(true);
    const router = useRouter();

    useEffect(() => {
        if (user) {
            const fetchUserWallpapers = async () => {
                setLoadingWallpapers(true);
                const [liked, downloaded] = await Promise.all([
                    getLikedWallpapers(user.uid),
                    getDownloadedWallpapers(user.uid)
                ]);
                setLikedWallpapers(liked);
                setDownloadedWallpapers(downloaded);
                setLoadingWallpapers(false);
            };
            fetchUserWallpapers();
        } else if (!loading) {
            router.push('/auth/login');
        }
    }, [user, loading, router]);

    if (loading) {
        return <ProfilePageSkeleton />;
    }

    if (!user) {
         return (
            <div className="text-center py-16">
                 <h1 className="text-4xl font-bold font-headline mb-4">Not Logged In</h1>
                 <p className="text-muted-foreground mb-6">
                    You need to be logged in to view your profile.
                 </p>
                 <Link href="/auth/login" className={buttonVariants()}>
                    Login
                 </Link>
            </div>
        )
    }

  return (
    <>
        <div className="space-y-8">
            <Link href="/menu" className={cn(buttonVariants({ variant: 'ghost' }), "pl-0")}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Menu
            </Link>
            
            <Card className="max-w-4xl mx-auto overflow-hidden">
                <div className="h-32 bg-gradient-to-r from-primary/20 to-secondary/20" />
                <CardHeader className="flex-col sm:flex-row items-start sm:items-center gap-4 -mt-16 px-6 pt-6">
                    <Avatar className="w-28 h-28 border-4 border-background">
                        <AvatarImage src={user.photoURL || `https://api.dicebear.com/8.x/bottts-neutral/svg?seed=${user.uid}`} alt={user.displayName || "User"}/>
                        <AvatarFallback>{user.displayName?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <CardTitle className="text-3xl font-bold">{user.displayName || 'User'}</CardTitle>
                        <CardDescription>{user.email}</CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="px-6 pb-6 space-y-8">
                    {loadingWallpapers ? (
                        <>
                           <div className="space-y-4">
                               <Skeleton className="h-8 w-40" />
                               <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                   {[...Array(4)].map((_, i) => <Skeleton key={i} className="aspect-[9/16] w-full" />)}
                               </div>
                           </div>
                             <div className="space-y-4">
                               <Skeleton className="h-8 w-40" />
                               <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                   {[...Array(4)].map((_, i) => <Skeleton key={i} className="aspect-[9/16] w-full" />)}
                               </div>
                           </div>
                        </>
                    ) : (
                       <>
                           <WallpaperPreviewGrid 
                                title="Favorites" 
                                wallpapers={likedWallpapers} 
                                viewMoreLink="/menu/profile/favorites"
                                icon={Heart}
                                iconColor="text-red-500"
                           />
                           <WallpaperPreviewGrid 
                                title="Downloaded" 
                                wallpapers={downloadedWallpapers} 
                                viewMoreLink="/menu/profile/downloads"
                                icon={Download}
                                iconColor="text-primary"
                           />
                       </>
                    )}
                </CardContent>
            </Card>
        </div>
    </>
  );
}


function ProfilePageSkeleton() {
    return (
        <div className="space-y-8 animate-pulse">
                <Skeleton className="h-10 w-32" />
                <Card className="max-w-4xl mx-auto overflow-hidden">
                     <Skeleton className="h-32 w-full" />
                     <div className="flex-col sm:flex-row items-start sm:items-center gap-4 -mt-16 px-6 pt-6 flex">
                        <Skeleton className="w-28 h-28 rounded-full border-4 border-background" />
                        <div className="flex-1 mt-4 sm:mt-16 space-y-2">
                            <Skeleton className="h-8 w-48" />
                            <Skeleton className="h-4 w-64" />
                        </div>
                     </div>
                     <CardContent className="px-6 pb-6 mt-8 space-y-8">
                         <div>
                            <Skeleton className="h-8 w-40 mb-4" />
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {[...Array(4)].map((_, i) => <Skeleton key={i} className="aspect-[9/16] w-full" />)}
                            </div>
                         </div>
                         <div>
                            <Skeleton className="h-8 w-40 mb-4" />
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {[...Array(4)].map((_, i) => <Skeleton key={i} className="aspect-[9/16] w-full" />)}
                            </div>
                         </div>
                     </CardContent>
                </Card>
        </div>
    )
}
