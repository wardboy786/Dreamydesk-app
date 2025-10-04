
"use client";

import { useAdVisibility, AdVisibilityProvider } from '@/hooks/use-ad-visibility';

export function AdProvider({ children }: { children: React.ReactNode }) {
    return (
        <AdVisibilityProvider>
            {children}
        </AdVisibilityProvider>
    );
}
