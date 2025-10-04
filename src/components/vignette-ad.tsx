
"use client";

import { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';

// This component has been deprecated as Vignette ads are often a cause
// for AdSense rejection ("Ads on screens with no content").
// Removing its logic ensures better compliance.
export default function VignetteAd() {
    const { isPremium, loading } = useAuth();

    useEffect(() => {
        if (loading || isPremium) {
            return;
        }

        // The ad script logic has been removed.
        
    }, [isPremium, loading]);

    return null; 
}
