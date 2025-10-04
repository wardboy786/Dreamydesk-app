
"use client";

import { useState, useEffect } from 'react';
import { notFound, useRouter } from 'next/navigation';
import { getCollectionById } from '@/services/collection.service';
import { getWallpapersByIds } from '@/services/wallpaper.service';
import { CuratedCollection, Wallpaper } from '@/lib/types';
import WallpaperGrid from '@/components/wallpaper-grid';
import { Skeleton } from '@/components/ui/skeleton';
import { buttonVariants, Button } from '@/components/ui/button';
import { ArrowLeft, Gem } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function CollectionPageComponent({ id }: { id: string }) {
  const [collection, setCollection] = useState<CuratedCollection | null>(null);
  const [wallpapers, setWallpapers] = useState<Wallpaper[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isPremium, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const collectionData = await getCollectionById(id);
        
        if (!collectionData) {
          notFound();
          return;
        }

        setCollection(collectionData);
        const wallpapersData = await getWallpapersByIds(collectionData.wallpaperIds);
        setWallpapers(wallpapersData);

      } catch (error) {
        console.error("Failed to fetch collection data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading || authLoading) {
    return <CollectionPageSkeleton />;
  }

  if (!collection) {
    notFound();
  }

  return (
    <>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <Link href="/" className={cn(buttonVariants({ variant: 'ghost' }), "pl-0")}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                </Link>
            </div>
        <div className="text-center mb-8">
            <h1 className="text-4xl font-bold font-headline">{collection.title}</h1>
            <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">{collection.description}</p>
        </div>
        
        <WallpaperGrid wallpapers={wallpapers} collectionId={id} />
        </div>
    </>
  );
}


function CollectionPageSkeleton() {
    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
            <div className="mb-8 w-24 h-10">
                <Skeleton className="h-full w-full" />
            </div>
            <div className='text-center mb-8'>
                <Skeleton className="h-12 w-1/2 mx-auto" />
                <Skeleton className="h-4 w-2/3 mx-auto mt-4" />
            </div>
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
