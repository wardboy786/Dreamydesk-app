
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import Link from "next/link";
import { ArrowLeft, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { getLikedWallpapers } from "@/services/user-service";
import { Wallpaper } from "@/lib/types";
import WallpaperGrid from "@/components/wallpaper-grid";
import { useRouter } from "next/navigation";
import { WallpaperGridSkeleton } from "@/components/skeletons/wallpaper-grid-skeleton";

export default function FavoritesPage() {
    const { user, loading: authLoading } = useAuth();
    const [wallpapers, setWallpapers] = useState<Wallpaper[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/auth/login');
        } else if (user) {
            getLikedWallpapers(user.uid)
                .then(setWallpapers)
                .finally(() => setLoading(false));
        }
    }, [user, authLoading, router]);

    return (
        <div className="space-y-8">
            <Link href="/menu/profile" className={cn(buttonVariants({ variant: 'ghost' }), "pl-0")}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Profile
            </Link>

            <div className="text-center">
                <h1 className="text-4xl font-bold font-headline flex items-center justify-center gap-3">
                    <Heart className="w-8 h-8 text-red-500" /> My Favorites
                </h1>
                <p className="text-muted-foreground mt-2">All the wallpapers you've liked.</p>
            </div>
            
            {loading ? (
                <WallpaperGridSkeleton count={12} />
            ) : wallpapers.length > 0 ? (
                <WallpaperGrid wallpapers={wallpapers} />
            ) : (
                <div className="text-center py-16">
                    <p className="text-muted-foreground">You haven&apos;t liked any wallpapers yet.</p>
                    <Link href="/" className={cn(buttonVariants({variant: "link"}), "mt-2")}>Browse Wallpapers</Link>
                </div>
            )}
        </div>
    );
}
