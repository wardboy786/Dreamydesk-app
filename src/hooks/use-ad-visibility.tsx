
"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

interface AdVisibilityContextType {
    isBottomAdVisible: boolean;
    setIsBottomAdVisible: (isVisible: boolean) => void;
}

const AdVisibilityContext = createContext<AdVisibilityContextType | undefined>(undefined);

export const useAdVisibility = () => {
    const context = useContext(AdVisibilityContext);
    if (context === undefined) {
        throw new Error('useAdVisibility must be used within an AdVisibilityProvider');
    }
    return context;
};

export const AdVisibilityProvider = ({ children }: { children: React.ReactNode }) => {
    const [isBottomAdVisible, setIsBottomAdVisible] = useState(false);
    
    useEffect(() => {
        const handleScroll = () => {
            // Show the ad when scrolled past a certain point, e.g., 200px
            if (window.scrollY > 200) {
                setIsBottomAdVisible(true);
            } else {
                setIsBottomAdVisible(false);
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll(); // Initial check

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <AdVisibilityContext.Provider value={{ isBottomAdVisible, setIsBottomAdVisible }}>
            {children}
        </AdVisibilityContext.Provider>
    );
};
