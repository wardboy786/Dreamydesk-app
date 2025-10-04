
import { Suspense } from "react";
import CollectionsGrid from "@/components/home/collections-grid";
import PopularWallpapers from "@/components/home/popular-wallpapers";
import { CollectionsSkeleton } from "@/components/skeletons/collections-skeleton";
import { WallpaperGridSkeleton } from "@/components/skeletons/wallpaper-grid-skeleton";
import FeaturedCarousel from "./featured-carousel";
import { CuratedCollection, Wallpaper } from "@/lib/types";

// This component is now a simple, fast-rendering server component that receives all data as props.
interface HomePageContentProps {
  featuredWallpapers: Wallpaper[];
  collections: CuratedCollection[];
  popularWallpapers: Wallpaper[];
}

export default function HomePageContent({ 
  featuredWallpapers, 
  collections, 
  popularWallpapers 
}: HomePageContentProps) {

  return (
    <>
      {/* 
        Each section is wrapped in its own Suspense boundary.
        This allows content to appear as soon as its data is ready,
        but since we fetch in parallel, it will be very fast.
      */}
      <FeaturedCarousel featuredWallpapers={featuredWallpapers} />
      
      <Suspense fallback={<CollectionsSkeleton />}>
        <CollectionsGrid collections={collections} />
      </Suspense>
      
      <Suspense fallback={<WallpaperGridSkeleton count={12} />}>
        <PopularWallpapers popularWallpapers={popularWallpapers} />
      </Suspense>
    </>
  );
}
