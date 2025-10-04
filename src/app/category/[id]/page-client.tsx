
"use client";

import { useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import { getCategoryById, getWallpapersByCategory } from '@/services/category.service';
import { Category, Wallpaper } from '@/lib/types';
import WallpaperGrid from '@/components/wallpaper-grid';
import { Skeleton } from '@/components/ui/skeleton';
import { buttonVariants } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function CategoryPageComponent({ id }: { id: string }) {
  const [category, setCategory] = useState<Category | null>(null);
  const [wallpapers, setWallpapers] = useState<Wallpaper[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const categoryData = await getCategoryById(id);
        
        if (!categoryData) {
          notFound();
          return;
        }

        setCategory(categoryData);
        
        const wallpapersData = await getWallpapersByCategory(categoryData.name);
        setWallpapers(wallpapersData);

      } catch (error) {
        console.error("Failed to fetch category data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return <CategoryPageSkeleton />;
  }

  if (!category) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
             <Link href="/" className={cn(buttonVariants({ variant: 'ghost' }), "pl-0")}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Link>
        </div>
      <h1 className="text-4xl font-bold font-headline mb-8 text-center">{category.name}</h1>
      <WallpaperGrid wallpapers={wallpapers} />
    </div>
  );
}


function CategoryPageSkeleton() {
    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
            <div className="mb-8 w-24 h-10">
                <Skeleton className="h-full w-full" />
            </div>
            <Skeleton className="h-12 w-1/3 mx-auto mb-8" />
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 md:gap-6">
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
