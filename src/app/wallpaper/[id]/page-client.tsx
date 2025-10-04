
"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { notFound } from 'next/navigation';
import type { Wallpaper } from "@/lib/types";
import { getWallpaperById, getMoreRelatedWallpapers } from "@/services/wallpaper.service";
import WallpaperSlide from "@/components/wallpaper/wallpaper-slide";
import { Loader2 } from "lucide-react";
import { WallpaperPageSkeleton } from "@/components/skeletons/wallpaper-page-skeleton";

interface WallpaperPageComponentProps {
  initialWallpaperId: string;
}

export default function WallpaperPageComponent({ initialWallpaperId }: WallpaperPageComponentProps) {
  const [feed, setFeed] = useState<Wallpaper[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastWallpaperRef = useRef<HTMLDivElement | null>(null);

  // Correctly fetch the initial wallpaper
  useEffect(() => {
    async function fetchInitialWallpaper() {
      setIsLoading(true);
      try {
        const initialWallpaper = await getWallpaperById(initialWallpaperId, true);
        if (initialWallpaper) {
          setFeed([initialWallpaper]);
        } else {
          notFound();
        }
      } catch (error) {
        console.error("Failed to fetch initial wallpaper:", error);
        notFound();
      } finally {
        setIsLoading(false);
      }
    }
    fetchInitialWallpaper();
  }, [initialWallpaperId]);
  
  const loadMoreWallpapers = useCallback(async () => {
    if (isLoadingMore || feed.length === 0) return;
    
    setIsLoadingMore(true);
    try {
        const lastWallpaper = feed[feed.length - 1];
        const seenIds = feed.map(w => w.id);
        const newWallpapers = await getMoreRelatedWallpapers(lastWallpaper, 5, seenIds);
        
        if (newWallpapers.length > 0) {
            setFeed(prevFeed => [...prevFeed, ...newWallpapers]);
        }
    } catch (error) {
        console.error("Failed to fetch more wallpapers:", error);
    } finally {
        setIsLoadingMore(false);
    }
  }, [feed, isLoadingMore]);


  // Setup intersection observer
  useEffect(() => {
    if (isLoading) return; // Don't setup observer until initial content is loaded
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && !isLoadingMore) {
          loadMoreWallpapers();
        }
      },
      { threshold: 0.5 } // Trigger when 50% of the last item is visible
    );

    if (lastWallpaperRef.current) {
      observerRef.current.observe(lastWallpaperRef.current);
    }

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [loadMoreWallpapers, isLoadingMore, isLoading]);

  if (isLoading) {
    return <WallpaperPageSkeleton />;
  }

  return (
    <div className="h-screen w-screen snap-y snap-mandatory overflow-y-auto bg-black">
      {feed.map((wallpaper, index) => {
        const isLast = index === feed.length - 1;
        return (
          <div
            key={wallpaper.id}
            ref={isLast ? lastWallpaperRef : null}
            className="h-full w-full snap-start flex items-center justify-center relative"
          >
            <WallpaperSlide wallpaper={wallpaper} />
          </div>
        );
      })}
      {isLoadingMore && (
        <div className="h-full w-full snap-start flex items-center justify-center text-white">
           <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin" />
            <p className="text-muted-foreground">Finding more wallpapers...</p>
           </div>
        </div>
      )}
    </div>
  );
}
