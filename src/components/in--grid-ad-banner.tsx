
"use client";

import { useAuth } from "@/hooks/use-auth";
import { useEffect, useRef, useState } from "react";
import { AdSkeleton } from "./skeletons/ad-skeleton";

export function InGridAdBanner() {
    const { isPremium, loading: authLoading } = useAuth();
    const adContainerRef = useRef<HTMLDivElement>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (isPremium) return;

        const adContainer = adContainerRef.current;
        if (adContainer) {
            // Clear previous ad content
            adContainer.innerHTML = '';
            setIsLoading(true);

            // Create script for ad configuration
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
            
            // Create script for ad invocation
            const invokeScript = document.createElement('script');
            invokeScript.type = 'text/javascript';
            invokeScript.src = '//jigsawharmony.com/13a433689d89d523420052117903026c/invoke.js';

            // Append scripts to the container
            adContainer.appendChild(adScript);
            adContainer.appendChild(invokeScript);
            
            // Observe the container for when the ad (iframe) is added
            const observer = new MutationObserver((mutations) => {
                for (const mutation of mutations) {
                    if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                        const iframe = adContainer.querySelector('iframe');
                        if (iframe) {
                            setIsLoading(false);
                            observer.disconnect();
                            break;
                        }
                    }
                }
            });

            observer.observe(adContainer, { childList: true, subtree: true });
            
            return () => {
                observer.disconnect();
                if (adContainer) {
                    adContainer.innerHTML = '';
                }
            };
        }
    }, [isPremium]);

    if (authLoading || isPremium) {
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
