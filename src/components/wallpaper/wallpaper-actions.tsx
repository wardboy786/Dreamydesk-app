
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
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Wallpaper as CapacitorWallpaper } from 'capacitor-modern-wallpaper';

function getGuestId(): string {
    if (typeof window === 'undefined') return 'server_guest';
    let guestId = localStorage.getItem('guestId');
    if (!guestId) {
        guestId = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
        localStorage.setItem('guestId', guestId);
    }
    return guestId;
}

// New component for the "Set As" overlay
function SetWallpaperOverlay({ onSet, onCancel }: { onSet: (mode: 'HOME' | 'LOCK' | 'BOTH') => void; onCancel: () => void; }) {
    return (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center animate-in fade-in-0">
            <div className="bg-card text-card-foreground rounded-lg p-6 w-[90vw] max-w-sm text-center space-y-4">
                <h3 className="text-xl font-bold">Set as Wallpaper</h3>
                <p className="text-muted-foreground">Where would you like to set this wallpaper?</p>
                <div className="grid grid-cols-1 gap-2">
                    <Button onClick={() => onSet('HOME')}><Home className="mr-2" /> Home Screen</Button>
                    <Button onClick={() => onSet('LOCK')}><LockIcon className="mr-2" /> Lock Screen</Button>
                    <Button onClick={() => onSet('BOTH')}><Smartphone className="mr-2" /> Both</Button>
                </div>
                <Button variant="ghost" onClick={onCancel}>Cancel</Button>
            </div>
        </div>
    );
}


function WallpaperActionsComponent({ wallpaper }: { wallpaper: Wallpaper }) {
    const { toast } = useToast();
    const { user, loading: authLoading } = useAuth();
    const searchParams = useSearchParams();
    const fromCollection = searchParams.get('fromCollection');
    
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(wallpaper.likes);
    const [isDownloading, setIsDownloading] = useState(false);
    const [showSetAsOverlay, setShowSetAsOverlay] = useState(false);
    const [downloadedFilePath, setDownloadedFilePath] = useState<string | null>(null);
    
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
        toast({ title: "Preparing Download...", description: "Your wallpaper is being prepared." });

        try {
            const file = await downloadWallpaper(wallpaper.id);
            const fileName = `${wallpaper.id}.${file.contentType.split('/')[1] || 'jpg'}`;

            if (isNative) {
                // Native platform: Save to filesystem and show "Set As" overlay
                const result = await Filesystem.writeFile({
                    path: fileName,
                    data: file.base64,
                    directory: Directory.Cache, // Use cache directory for temporary storage
                });
                setDownloadedFilePath(result.uri);
                setShowSetAsOverlay(true);
            } else {
                // Web platform: Trigger browser download
                const byteCharacters = atob(file.base64);
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) { byteNumbers[i] = byteCharacters.charCodeAt(i); }
                const byteArray = new Uint8Array(byteNumbers);
                const blob = new Blob([byteArray], { type: file.contentType });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.style.display = "none";
                a.href = url;
                a.download = `${wallpaper.title.replace(/ /g, "_")}.${file.contentType.split('/')[1] || 'jpg'}`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
                toast({ title: "Download Started!", description: "Your wallpaper is now downloading." });
            }
            
            // Log analytics for both platforms
            await updateWallpaperDownloads(wallpaper.id);
            const userId = user ? user.uid : getGuestId();
            await addDownloadedWallpaper(userId, wallpaper.id);
            if (fromCollection) {
                await logCollectionDownload(wallpaper.id, fromCollection, userId);
            }

        } catch (error) {
            console.error("Download failed:", error);
            const errorMessage = error instanceof Error ? error.message : "Could not download wallpaper. Please try again.";
            toast({ variant: "destructive", title: "Download Failed", description: errorMessage });
        } finally {
            if (!isNative) {
              setIsDownloading(false);
            }
        }
    }, [isDownloading, wallpaper, toast, user, fromCollection, isNative]);
    
    const handleSetWallpaper = async (mode: 'HOME' | 'LOCK' | 'BOTH') => {
        if (!downloadedFilePath) {
            toast({ variant: 'destructive', title: 'Error', description: 'File path not found.'});
            return;
        }
        try {
            toast({ title: 'Applying Wallpaper...', description: 'Please wait a moment.' });
            await CapacitorWallpaper.setWallpaper({
                path: downloadedFilePath,
                which: mode
            });
            toast({ title: 'Success!', description: 'Wallpaper has been set.' });
        } catch (error: any) {
             toast({ variant: 'destructive', title: 'Failed to Set', description: error.message || 'Could not set the wallpaper.' });
        } finally {
            setShowSetAsOverlay(false);
            setDownloadedFilePath(null);
            setIsDownloading(false);
        }
    }


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
            {showSetAsOverlay && <SetWallpaperOverlay onSet={handleSetWallpaper} onCancel={() => { setShowSetAsOverlay(false); setIsDownloading(false); }} />}
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
