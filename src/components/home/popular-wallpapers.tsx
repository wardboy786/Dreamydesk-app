
import { Wallpaper } from "@/lib/types";
import WallpaperGrid from "@/components/wallpaper-grid";

// This is now a simple component that just receives data.
interface PopularWallpapersProps {
  popularWallpapers: Wallpaper[];
}

export default function PopularWallpapers({ popularWallpapers }: PopularWallpapersProps) {
    if (!popularWallpapers || popularWallpapers.length === 0) {
        return null;
    }

    return (
        <section>
            <div className="text-center mb-8">
                <h2 className="font-headline text-3xl font-bold">Popular Wallpapers</h2>
                <p className="text-muted-foreground">See what wallpapers are trending right now.</p>
            </div>
            <WallpaperGrid wallpapers={popularWallpapers} priorityImageCount={0} />
        </section>
    );
}
