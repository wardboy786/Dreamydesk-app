"use client";

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';

// Define the shape of the BeforeInstallPromptEvent
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface InstallPromptContextType {
  installPrompt: (() => Promise<{ outcome: 'accepted' | 'dismissed' }>) | null;
  canInstall: boolean;
  setCanInstall: (canInstall: boolean) => void;
}

const InstallPromptContext = createContext<InstallPromptContextType | undefined>(undefined);

export const InstallPromptProvider = ({ children }: { children: ReactNode }) => {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setPromptEvent(e as BeforeInstallPromptEvent);
      setCanInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Also check if the app is already installed
    window.addEventListener('appinstalled', () => {
      setCanInstall(false);
      setPromptEvent(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const installPrompt = async () => {
    if (!promptEvent) {
      throw new Error('Installation prompt not available');
    }
    promptEvent.prompt();
    const choice = await promptEvent.userChoice;
    setPromptEvent(null); // The prompt can only be used once.
    return choice;
  };

  return (
    <InstallPromptContext.Provider value={{ installPrompt: promptEvent ? installPrompt : null, canInstall, setCanInstall }}>
      {children}
    </InstallPromptContext.Provider>
  );
};

export const useInstallPrompt = (): InstallPromptContextType => {
  const context = useContext(InstallPromptContext);
  if (context === undefined) {
    throw new Error('useInstallPrompt must be used within an InstallPromptProvider');
  }
  return context;
};
