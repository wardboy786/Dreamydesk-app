
"use client";

import { useState, useEffect, Suspense, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Download, Heart, Share2, Loader2, Home, Lock as LockIcon, Smartphone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { isWallpaperLiked, toggleWallpaperLike, addDownloadedWallpaper } from "@/services/user-service";
import { updateWallpaperLikes, updateWallpaperDownloads, downloadWallpaper } from "@/services/wallpaper.service";
import { logCollectionDownload } from "@/services/analytics-service";
import { Wallpaper } from "@/lib/types";
import { useSearchParams } from "next/navigation";
import { Capacitor } from '@capacitor/core';
import WallpaperPlugin from '@/services/wallpaper-plugin';


function getGuestId(): string {
    if (typeof window === 'undefined') return 'server_guest';
    let guestId = localStorage.getItem('guestId');
    if (!guestId) {
        guestId = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
        localStorage.setItem('guestId', guestId);
    }
    return guestId;
}


function WallpaperActionsComponent({ wallpaper }: { wallpaper: Wallpaper }) {
    const { toast } = useToast();
    const { user, loading: authLoading } = useAuth();
    const searchParams = useSearchParams();
    const fromCollection = searchParams.get('fromCollection');
    
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(wallpaper.likes);
    const [isDownloading, setIsDownloading] = useState(false);
    
    const isNative = Capacitor.isNativePlatform();

    useEffect(() => {
        if (authLoading) return;
        const checkLikedStatus = async () => {
            const userId = user?.uid || getGuestId();
            const liked = await isWallpaperLiked(userId, wallpaper.id);
            setIsLiked(liked);
        };
        checkLikedStatus();
    }, [user, wallpaper.id, authLoading]);

    const handleDownloadRequest = useCallback(async () => {
        if (isDownloading) return;

        setIsDownloading(true);
        toast({ title: "Preparing Wallpaper...", description: "Your wallpaper is being prepared." });

        try {
            const file = await downloadWallpaper(wallpaper.id);
            
            if (isNative && Capacitor.getPlatform() === 'android') {
                // Native Android platform: Use the custom plugin to set the wallpaper directly.
                await WallpaperPlugin.setWallpaper({ base64: file.base64 });
                toast({ title: "Wallpaper Set!", description: `${wallpaper.title} has been set as your wallpaper.` });
            } else {
                // Web platform or other native platforms: Trigger browser download
                const fileName = `${wallpaper.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${wallpaper.id}.${file.contentType.split('/')[1] || 'jpg'}`;
                const byteCharacters = atob(file.base64);
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) { byteNumbers[i] = byteCharacters.charCodeAt(i); }
                const byteArray = new Uint8Array(byteNumbers);
                const blob = new Blob([byteArray], { type: file.contentType });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.style.display = "none";
                a.href = url;
                a.download = fileName;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
                toast({ title: "Download Started!", description: "Your wallpaper is now downloading." });
            }
            
            // Log analytics for all platforms
            await updateWallpaperDownloads(wallpaper.id);
            const userId = user ? user.uid : getGuestId();
            await addDownloadedWallpaper(userId, wallpaper.id);
            if (fromCollection) {
                await logCollectionDownload(wallpaper.id, fromCollection, userId);
            }

        } catch (error) {
            console.error("Download or Set Wallpaper failed:", error);
            const errorMessage = error instanceof Error ? error.message : "Could not complete the action. Please try again.";
            toast({ variant: "destructive", title: "Action Failed", description: errorMessage });
        } finally {
            setIsDownloading(false);
        }
    }, [isDownloading, wallpaper, toast, user, fromCollection, isNative]);


    const handleLike = async () => {
        if (authLoading) return;
        const userId = user?.uid || getGuestId();
        const currentlyLiked = isLiked;
        setIsLiked(!currentlyLiked);
        setLikeCount(current => currentlyLiked ? current - 1 : current + 1);

        try {
            await toggleWallpaperLike(userId, wallpaper.id, !currentlyLiked);
            await updateWallpaperLikes(wallpaper.id, !currentlyLiked);
        } catch (error) {
            console.error("Failed to update like status", error);
            setIsLiked(currentlyLiked);
            setLikeCount(current => currentlyLiked ? current + 1 : current + 1);
            toast({ variant: "destructive", title: "Error", description: "Could not update like status." });
        }
    };

    const handleShare = async () => {
        const shareData = { title: `Check out this wallpaper: ${wallpaper.title}`, text: `I found this amazing wallpaper on DreamyDesk!`, url: window.location.href };
        if (navigator.share) {
            try { await navigator.share(shareData); } catch (error) {
                if ((error as DOMException).name !== 'AbortError') {
                    console.error("Error sharing:", error);
                    toast({ variant: "destructive", title: "Error Sharing", description: "Could not share the wallpaper at this time." });
                }
            }
        } else {
            navigator.clipboard.writeText(window.location.href);
            toast({ title: "Link Copied!", description: "Wallpaper link copied to your clipboard." });
        }
    };

    if (authLoading) {
        return <div className="flex flex-col items-center gap-6 text-white"><Loader2 className="w-8 h-8 animate-spin drop-shadow-md"/></div>;
    }

    return (
        <>
            <div className="absolute right-4 bottom-24 flex flex-col items-center gap-8 text-white">
                <button onClick={handleLike} className="flex flex-col items-center gap-1.5 text-center" disabled={authLoading}>
                    <Heart className={cn("w-8 h-8 drop-shadow-lg transition-all", isLiked ? 'fill-red-500 text-red-500' : 'text-white')} />
                    <span className="text-xs font-bold drop-shadow-md">{Intl.NumberFormat('en-US', { notation: 'compact' }).format(likeCount || 0)}</span>
                </button>
                
                <button onClick={handleDownloadRequest} className="flex flex-col items-center gap-1.5 text-center" disabled={isDownloading || authLoading}>
                    {isDownloading ? <Loader2 className="w-8 h-8 animate-spin drop-shadow-lg" /> : <Download className="w-8 h-8 drop-shadow-lg" />}
                    <span className="text-xs font-bold drop-shadow-md">{Intl.NumberFormat('en-US', { notation: 'compact' }).format(wallpaper.downloads || 0)}</span>
                </button>

                <button onClick={handleShare} className="flex flex-col items-center gap-1.5 text-center">
                    <Share2 className="w-8 h-8 drop-shadow-lg" />
                </button>
            </div>
        </>
    );
}

export default function WallpaperActions({ wallpaper }: { wallpaper: Wallpaper }) {
    return (
        <Suspense fallback={null}>
            <WallpaperActionsComponent wallpaper={wallpaper} />
        </Suspense>
    )
}
