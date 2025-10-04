
"use client";

import { useEffect, useState } from "react";
import { getRelatedWallpapers } from "@/services/wallpaper.service";
import type { Wallpaper } from "@/lib/types";
import WallpaperGrid from "../wallpaper-grid";
import { WallpaperGridSkeleton } from "../skeletons/wallpaper-grid-skeleton";

interface RelatedWallpapersProps {
    currentWallpaper: Wallpaper;
}

export default function RelatedWallpapers({ currentWallpaper }: RelatedWallpapersProps) {
    const [related, setRelated] = useState<Wallpaper[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch related wallpapers on the client side
        getRelatedWallpapers(currentWallpaper, 8)
            .then(setRelated)
            .finally(() => setLoading(false));
    }, [currentWallpaper]);

    if (loading) {
        return <WallpaperGridSkeleton count={8} />;
    }

    if (related.length === 0) {
        return <p className="text-center text-muted-foreground">No related wallpapers found.</p>;
    }
    
    return <WallpaperGrid wallpapers={related} />;
}
