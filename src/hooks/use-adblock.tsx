
"use client";

import React, { createContext, useContext } from 'react';

// Ad-related hooks are currently disabled.
// This provider does nothing and can be removed if no longer needed.

interface AdBlockContextType {
    adBlockDetected: boolean;
}

const AdBlockContext = createContext<AdBlockContextType>({
    adBlockDetected: false,
});

export const useAdBlock = () => {
    return useContext(AdBlockContext);
};

export const AdBlockProvider = ({ children }: { children: React.ReactNode }) => {
    return (
        <AdBlockContext.Provider value={{ adBlockDetected: false }}>
            {children}
        </AdBlockContext.Provider>
    );
};
