
"use client";

import { useAuth } from "@/hooks/use-auth";
import { useEffect, useRef, useState } from "react";
import { AdSkeleton } from "./skeletons/ad-skeleton";

export function InGridAdBanner({ adKey }: { adKey: string }) {
    const { isPremium, loading: authLoading } = useAuth();
    const adContainerRef = useRef<HTMLDivElement>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const adContainer = adContainerRef.current;
        if (!adContainer || isPremium || authLoading) {
            return;
        }

        setIsLoading(true);
        // Important: Clear previous content to avoid script conflicts on re-render
        adContainer.innerHTML = ''; 

        const adScript = document.createElement('script');
        adScript.type = 'text/javascript';
        adScript.innerHTML = `
            atOptions = {
                'key' : '13a433689d89d523420052117903026c',
                'format' : 'iframe',
                'height' : 250,
                'width' : 300,
                'params' : {}
            };
        `;
        
        const invokeScript = document.createElement('script');
        invokeScript.type = 'text/javascript';
        invokeScript.src = '//jigsawharmony.com/13a433689d89d523420052117903026c/invoke.js';

        adContainer.appendChild(adScript);
        adContainer.appendChild(invokeScript);
        
        // Observe the container to detect when the ad (iframe) is actually added to the DOM
        const observer = new MutationObserver(() => {
            if (adContainer.querySelector('iframe, img, a')) {
                setIsLoading(false);
                observer.disconnect();
            }
        });

        observer.observe(adContainer, { childList: true, subtree: true });
        
        // Failsafe timer to hide the skeleton even if the ad fails to load
        const timer = setTimeout(() => {
            setIsLoading(false);
            observer.disconnect();
        }, 5000); 

        return () => {
            clearTimeout(timer);
            observer.disconnect();
            if (adContainer) {
                adContainer.innerHTML = '';
            }
        };
    }, [isPremium, authLoading, adKey]);

    if (isPremium || authLoading) {
        return null;
    }

    return (
        <div className="w-full flex justify-center items-center bg-muted/30 rounded-lg overflow-hidden p-4 min-h-[282px]">
            {isLoading && <AdSkeleton />}
            <div 
                ref={adContainerRef} 
                className="flex items-center justify-center"
                style={{ display: isLoading ? 'none' : 'flex' }}
            />
        </div>
    );
}
