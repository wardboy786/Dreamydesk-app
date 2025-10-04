
"use client";

import { Wallpaper } from "@/lib/types";
import WallpaperCard from "./wallpaper-card";

interface WallpaperGridProps {
  wallpapers: Wallpaper[];
  collectionId?: string; // Optional: To track origin for analytics
  priorityImageCount?: number; // Number of images to load with priority
  thumbnailSize?: { width: number; height: number };
}

export default function WallpaperGrid({ wallpapers, collectionId, priorityImageCount = 0, thumbnailSize = { width: 450, height: 800 } }: WallpaperGridProps) {
  
  if (!wallpapers || wallpapers.length === 0) {
    return <p className="text-center text-muted-foreground col-span-full">No wallpapers found.</p>
  }
  
  return (
    <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-2 md:gap-4">
      {wallpapers.map((wallpaper, i) => (
         <WallpaperCard key={wallpaper.id} wallpaper={wallpaper} priority={i < priorityImageCount} collectionId={collectionId} thumbnailSize={thumbnailSize} />
      ))}
    </div>
  );
}
