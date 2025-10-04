
import { Suspense } from "react";
import HomePageContent from "@/components/home/home-page-content";
import { FeaturedCarouselSkeleton } from "@/components/skeletons/featured-carousel-skeleton";
import HomePageTabs from "@/components/home/home-page-tabs";
import { Loader } from "@/components/ui/loader";
import { getFeaturedWallpapers, getPopularWallpapers } from "@/services/wallpaper.service";
import { getAllCollections } from "@/services/collection.service";

export default async function HomePage() {
  // --- OPTIMIZATION: Fetch all data in parallel at the top level ---
  const [featuredWallpapers, collections, popularWallpapers] = await Promise.all([
    getFeaturedWallpapers(9),
    getAllCollections(5),
    getPopularWallpapers(50)
  ]);

  return (
    <>
      <div id="home-content" className="space-y-12">
        <Suspense fallback={<FeaturedCarouselSkeleton />}>
          {/* Pass all fetched data down as props */}
          <HomePageContent 
            featuredWallpapers={featuredWallpapers}
            collections={collections}
            popularWallpapers={popularWallpapers}
          />
        </Suspense>
      </div>
      
      <Suspense fallback={<div className="mt-12"><Loader /></div>}>
        <HomePageTabs />
      </Suspense>
    </>
  )
}
