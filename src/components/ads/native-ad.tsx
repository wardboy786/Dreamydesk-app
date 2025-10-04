
"use client";

import { useAuth } from "@/hooks/use-auth";
import { AdSkeleton } from "../skeletons/ad-skeleton";

export function NativeAd({ adKey }: { adKey: string }) {
    const { isPremium, loading: authLoading } = useAuth();

    if (isPremium || authLoading) {
        return null;
    }

    return (
        <div className="w-full h-full flex justify-center items-center rounded-lg overflow-hidden">
            {/* Zaraz will target this ID to inject the native ad. */}
            <div id={`ad-container-${adKey}`} className="w-full h-full flex items-center justify-center">
                <AdSkeleton />
            </div>
        </div>
    );
}
