
"use client";

import { useState } from 'react';
import type { Wallpaper } from "@/lib/types";
import WallpaperImage from "@/components/wallpaper/wallpaper-image";
import WallpaperActions from "@/components/wallpaper/wallpaper-actions";
import WallpaperDetails from "@/components/wallpaper/wallpaper-details";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Lock, ChevronUp, Gem } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import Link from 'next/link';
import { Button } from '../ui/button';

function AnimatedArrow() {
    return (
        <div className="relative flex justify-center items-center h-12 w-12">
            <div className="absolute h-10 w-10 rounded-full bg-white/20 animate-[pulse-ring_2s_cubic-bezier(0.16,1,0.3,1)_infinite]"></div>
            <div className="absolute h-10 w-10 rounded-full bg-white/20 animate-[pulse-ring_2s_cubic-bezier(0.16,1,0.3,1)_infinite]" style={{ animationDelay: '0.5s' }}></div>
            <ChevronUp className="h-8 w-8 text-white drop-shadow-lg swipe-up-arrow" />
        </div>
    );
}

interface WallpaperSlideProps {
  wallpaper: Wallpaper;
}

export default function WallpaperSlide({ wallpaper }: WallpaperSlideProps) {
  const { isPremium, loading: authLoading } = useAuth();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  if (authLoading) {
      // You can return a simple skeleton or null during auth loading
      return null;
  }

  // The paywall is ONLY for exclusive wallpapers for non-premium users.
  const isLocked = wallpaper.isExclusive && !isPremium;

  return (
    <div className="relative w-full h-full">
      <WallpaperImage wallpaper={wallpaper} isLocked={isLocked} />
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20 pointer-events-none" />
      
      {isLocked && (
        <div className="absolute inset-0 z-20 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center text-white p-4">
            <Lock className="w-16 h-16 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Exclusive Wallpaper</h2>
            <p className="text-center mb-6 text-white/80">This wallpaper is only available to premium members.</p>
            <Button asChild size="lg" className="font-bold">
              <Link href="/menu/premium">
                <Gem className="mr-2" />
                Subscribe to Unlock
              </Link>
            </Button>
        </div>
      )}

      {/* UI Overlay */}
      <div className="absolute inset-0 z-10 flex flex-col justify-end p-4">
          <div className="flex justify-between items-end">
              {/* Centered Details Trigger */}
              <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
                  <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                      <SheetTrigger asChild>
                          <button className="flex flex-col items-center text-white text-center">
                              <AnimatedArrow />
                          </button>
                      </SheetTrigger>
                      <SheetContent side="bottom" className="bg-background/90 backdrop-blur-lg text-foreground border-t max-h-[75vh] flex flex-col">
                         <div className="p-6 overflow-y-auto">
                            <WallpaperDetails wallpaper={wallpaper} />
                         </div>
                      </SheetContent>
                  </Sheet>
              </div>

              {/* Right Side (Actions) */}
              <div className="absolute right-4 bottom-24 flex flex-col">
                  <WallpaperActions wallpaper={wallpaper} />
              </div>
          </div>
      </div>
    </div>
  );
}
