
"use client";

import Link from "next/link";
import type { Wallpaper } from "@/lib/types";
import { buttonVariants } from "@/components/ui/button";
import { ArrowLeft, Lock } from "lucide-react";
import WallpaperGrid from "@/components/wallpaper-grid";
import { cn } from "@/lib/utils";
import WallpaperImage from "@/components/wallpaper/wallpaper-image";
import WallpaperDetails from "@/components/wallpaper/wallpaper-details";
import WallpaperActions from "@/components/wallpaper/wallpaper-actions";
import { useAuth } from "@/hooks/use-auth";

interface WallpaperPageComponentProps {
  wallpaper: Wallpaper;
  popularWallpapers: Wallpaper[];
}

export default function WallpaperPageComponent({ wallpaper, popularWallpapers }: WallpaperPageComponentProps) {
  const { isPremium, loading: authLoading } = useAuth();
  const isLocked = false; // Never lock the wallpaper image

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
       <div className="mb-8">
          <Link href="/" className={cn(buttonVariants({ variant: 'ghost' }), "pl-0")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
      </div>

      <div className="flex flex-col lg:flex-row items-center lg:items-start lg:justify-center gap-8 lg:gap-12">
        <div className="w-full max-w-md lg:max-w-none lg:w-auto lg:flex-shrink-0 relative">
           <WallpaperImage wallpaper={wallpaper} isLocked={isLocked} />
        </div>
        
        <div className="w-full max-w-md lg:max-w-sm lg:flex-shrink-0">
          <div className="flex flex-col gap-6">
            <WallpaperDetails wallpaper={wallpaper} />
            <WallpaperActions wallpaper={wallpaper} />
          </div>
        </div>
      </div>

       <section className="mt-16">
        <h2 className="text-3xl font-headline font-bold mb-6 text-center">You might also like</h2>
        <WallpaperGrid wallpapers={popularWallpapers} />
      </section>
    </div>
  );
}
