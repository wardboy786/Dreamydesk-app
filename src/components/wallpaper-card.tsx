
"use client";

import Link from "next/link";
import { Download, Eye, Heart, Gem, Lock } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Wallpaper } from "@/lib/types";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import OptimizedImage from "./optimized-image";
import CollectionClickLogger from "./home/collection-click-logger";
import { cn } from "@/lib/utils";
import { PremiumIcon } from "./premium-icon";
import { ExclusiveIcon } from "./exclusive-icon";

interface WallpaperCardProps {
  wallpaper: Wallpaper;
  className?: string;
  priority?: boolean;
  collectionId?: string; // Optional: To track origin for analytics
  thumbnailSize?: { width: number; height: number };
}

export default function WallpaperCard({ wallpaper, className, priority = false, collectionId, thumbnailSize }: WallpaperCardProps) {
  const imageUrlToShow = wallpaper.thumbnailUrl || wallpaper.imageUrl;
  
  const wallpaperLink = `/wallpaper/${wallpaper.id}${collectionId ? `?fromCollection=${collectionId}`: ''}`;

  const cardContent = (
    <Card className="overflow-hidden group transition-all duration-300 hover:shadow-xl hover:-translate-y-1 relative">
      {wallpaper.isExclusive && <ExclusiveIcon />}
      {wallpaper.premium && !wallpaper.isExclusive && <PremiumIcon />}
      <CardContent className="p-0 relative">
          <AspectRatio ratio={9 / 16} className="bg-muted">
            <OptimizedImage
              src={imageUrlToShow}
              alt={wallpaper.title}
              fill={!thumbnailSize} // Use fill only if thumbnailSize is not provided
              width={thumbnailSize?.width}
              height={thumbnailSize?.height}
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              priority={priority}
              data-ai-hint={wallpaper.aiHint}
              onContextMenu={(e) => e.preventDefault()}
            />
          </AspectRatio>
           <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-2 sm:p-3">
             
              <h3 className="text-white font-bold text-sm truncate drop-shadow-md">{wallpaper.title}</h3>
             
              <div className="flex items-center gap-2 text-white/90 text-[10px] mt-1">
                  <div className="flex items-center gap-0.5">
                      <Heart className="w-3 h-3" />
                      <span>{Intl.NumberFormat('en-US', { notation: 'compact' }).format(wallpaper.likes || 0)}</span>
                  </div>
                  <div className="flex items-center gap-0.5">
                      <Download className="w-3 h-3" />
                      <span>{Intl.NumberFormat('en-US', { notation: 'compact' }).format(wallpaper.downloads || 0)}</span>
                  </div>
                  <div className="flex items-center gap-0.5">
                      <Eye className="w-3 h-3" />
                      <span>{Intl.NumberFormat('en-US', { notation: 'compact' }).format(wallpaper.views || 0)}</span>
                  </div>
              </div>
          </div>
      </CardContent>
    </Card>
  );

  // If the card is part of a collection, wrap it with the analytics logger
  if (collectionId) {
    return (
      <CollectionClickLogger collectionId={collectionId}>
        <Link href={wallpaperLink} prefetch={true}>
            {cardContent}
        </Link>
      </CollectionClickLogger>
    );
  }

  // Otherwise, render a direct link
  return (
    <Link href={wallpaperLink} prefetch={true}>
        {cardContent}
    </Link>
  );
}
