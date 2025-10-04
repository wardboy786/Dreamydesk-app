
import OptimizedImage from "@/components/optimized-image";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Card } from "@/components/ui/card";
import { Wallpaper } from "@/lib/types";
import { cn } from "@/lib/utils";
import { getCdnUrl } from "@/lib/cdn";

interface WallpaperImageProps {
    wallpaper: Wallpaper;
    isLocked?: boolean;
}

export default function WallpaperImage({ wallpaper, isLocked = false }: WallpaperImageProps) {

    // Specifically request a high quality image for the main detail view
    const highQualitySrc = getCdnUrl(wallpaper.imageUrl, { quality: 90, width: 1080 });

    return (
        <div className="w-full h-full">
            <OptimizedImage
                src={highQualitySrc}
                alt={wallpaper.title}
                fill
                className={cn(
                    "object-cover", // Use cover to fill the screen, cropping if necessary
                    isLocked && "blur-xl scale-110" // Apply blur if locked
                )}
                style={{ pointerEvents: wallpaper.premium ? 'none' : 'auto' }}
                sizes="100vh" // The image takes up the full viewport height
                priority
                onContextMenu={(e) => e.preventDefault()}
            />
        </div>
    );
}
