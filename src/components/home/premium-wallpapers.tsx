
"use client";

import { useState, useEffect } from "react";
import { getPremiumWallpapers } from "@/services/wallpaper.service";
import { Wallpaper } from "@/lib/types";
import WallpaperGrid from "@/components/wallpaper-grid";
import { WallpaperGridSkeleton } from "../skeletons/wallpaper-grid-skeleton";

export default function PremiumWallpapers() {
    const [wallpapers, setWallpapers] = useState<Wallpaper[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getPremiumWallpapers()
            .then(setWallpapers)
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
       return <WallpaperGridSkeleton count={8} />;
    }

    if (!wallpapers || wallpapers.length === 0) {
        return <p className="text-center text-muted-foreground">No premium wallpapers found.</p>;
    }

    return (
        <section>
            <div className="text-center mb-8">
                <h2 className="font-headline text-3xl font-bold">Premium Wallpapers</h2>
                <p className="text-muted-foreground">Exclusive wallpapers from our best creators.</p>
            </div>
            <WallpaperGrid wallpapers={wallpapers} />
        </section>
    );
}
