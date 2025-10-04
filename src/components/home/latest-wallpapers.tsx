
"use client";

import { useState, useEffect } from "react";
import { getLatestWallpapers } from "@/services/wallpaper.service";
import { Wallpaper } from "@/lib/types";
import WallpaperGrid from "@/components/wallpaper-grid";
import { WallpaperGridSkeleton } from "../skeletons/wallpaper-grid-skeleton";

export default function LatestWallpapers() {
    const [wallpapers, setWallpapers] = useState<Wallpaper[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getLatestWallpapers(50)
            .then(setWallpapers)
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return <WallpaperGridSkeleton count={12} />;
    }

    if (!wallpapers || wallpapers.length === 0) {
        return <p className="text-center text-muted-foreground">No latest wallpapers found.</p>;
    }

    return (
        <section>
            <div className="text-center mb-8">
                <h2 className="font-headline text-3xl font-bold">Latest Wallpapers</h2>
                <p className="text-muted-foreground">The newest additions to our collection.</p>
            </div>
            <WallpaperGrid wallpapers={wallpapers} priorityImageCount={4} />
        </section>
    );
}
