
"use client";

import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import WallpaperCard from "@/components/wallpaper-card";
import Autoplay from "embla-carousel-autoplay";
import type { Wallpaper } from "@/lib/types";

// This is now a Client Component that receives data as props.
export default function FeaturedCarousel({ featuredWallpapers }: { featuredWallpapers: Wallpaper[] }) {
    if (!featuredWallpapers || featuredWallpapers.length === 0) {
        return null; // Don't render if there are no featured wallpapers
    }

    return (
        <section>
            <div className="text-center mb-8">
                <h2 className="font-headline text-3xl font-bold">Featured Wallpapers</h2>
                <p className="text-muted-foreground">Hand-picked wallpapers just for you.</p>
            </div>
            <Carousel
                opts={{
                    align: "start",
                    loop: true,
                }}
                plugins={[
                    Autoplay({
                        delay: 2500,
                        stopOnInteraction: false,
                        stopOnMouseEnter: true,
                    }),
                ]}
                className="w-full"                   
            >
                <CarouselContent className="-ml-4">
                    {featuredWallpapers.map((wallpaper, index) => (
                        <CarouselItem key={index} className="pl-4 basis-1/3 md:basis-1/4 lg:basis-1/5">
                            {/* The priority prop is crucial here for LCP. Request smaller images for carousel. */}
                            <WallpaperCard wallpaper={wallpaper} priority={index < 4} thumbnailSize={{ width: 270, height: 480 }} />
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <div className="hidden md:block">
                    <CarouselPrevious className="absolute left-[-1.5rem] top-1/2 -translate-y-1/2" />
                    <CarouselNext className="absolute right-[-1.5rem] top-1/2 -translate-y-1/2" />
                </div>
            </Carousel>
        </section>
    );
}
