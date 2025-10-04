
"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { searchWallpapers } from '@/services/wallpaper.service';
import { Wallpaper } from '@/lib/types';
import WallpaperGrid from '@/components/wallpaper-grid';
import { Skeleton } from '@/components/ui/skeleton';
import { buttonVariants } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';

  const [wallpapers, setWallpapers] = useState<Wallpaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasExactMatches, setHasExactMatches] = useState(true);

  useEffect(() => {
    if (!query) {
        setWallpapers([]);
        setLoading(false);
        return;
    };

    const performSearch = async () => {
      setLoading(true);
      try {
        const { results, hasExactMatches: exactMatchesFound } = await searchWallpapers(query);
        setWallpapers(results);
        setHasExactMatches(exactMatchesFound);
      } catch (error) {
        console.error("Failed to fetch search results:", error);
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [query]);

  if (loading) {
    return <CategoryPageSkeleton />;
  }
  
  const searchTitle = hasExactMatches
    ? `Results for "${query}"`
    : `No exact results for "${query}"`;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
             <Link href="/" className={cn(buttonVariants({ variant: 'ghost' }), "pl-0")}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Link>
        </div>
        
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold font-headline">
              {searchTitle}
          </h1>
          {!hasExactMatches && wallpapers.length > 0 && (
            <p className="text-muted-foreground mt-2">
                Showing related wallpapers you might like instead.
            </p>
          )}
           {!hasExactMatches && wallpapers.length === 0 && (
            <p className="text-muted-foreground mt-2">
                Sorry, we couldn't find any wallpapers. Try a different search.
            </p>
          )}
        </div>
        
        {wallpapers.length > 0 && <WallpaperGrid wallpapers={wallpapers} />}
    </div>
  );
}


export default function SearchPage() {
    return (
        <Suspense fallback={<CategoryPageSkeleton />}>
            <SearchResults />
        </Suspense>
    )
}


function CategoryPageSkeleton() {
    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
            <div className="mb-8 w-32 h-10">
                <Skeleton className="h-full w-full" />
            </div>
            <Skeleton className="h-12 w-1/2 mx-auto mb-8" />
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                <Skeleton className="aspect-[9/16] w-full" />
                <Skeleton className="aspect-[9/16] w-full" />
                <Skeleton className="aspect-[9/16] w-full" />
                <Skeleton className="aspect-[9/16] w-full" />
                <Skeleton className="aspect-[9/16] w-full" />
                <Skeleton className="aspect-[9/16] w-full" />
                 <Skeleton className="aspect-[9/16] w-full" />
                <Skeleton className="aspect-[9/16] w-full" />
            </div>
        </div>
    )
}
