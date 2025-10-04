
"use client";

import { useState, useEffect } from "react";
import { useInstallPrompt } from "@/hooks/use-install-prompt";
import { Button } from "@/components/ui/button";
import { X, DownloadCloud } from "lucide-react";
import { DreamyDeskLogo } from "./layout/dreamy-desk-logo";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

const SESSION_STORAGE_KEY_PWA = "pwa_prompt_session_hidden";

export default function InstallPwaToast() {
  const { installPrompt, canInstall, setCanInstall } = useInstallPrompt();
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissing, setIsDismissing] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Check if the app is running in standalone mode (i.e., installed)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsStandalone(true);
    }
  }, []);

  useEffect(() => {
    const isHiddenInSession = sessionStorage.getItem(SESSION_STORAGE_KEY_PWA) === "true";
    // Only show the prompt if it's installable, on the homepage, not standalone, and not dismissed this session.
    if (canInstall && !isStandalone && pathname === '/' && !isHiddenInSession) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 2000); // 2-second delay

      return () => clearTimeout(timer);
    }
  }, [canInstall, isStandalone, pathname]);

  const handleDismiss = () => {
    setIsDismissing(true);
    sessionStorage.setItem(SESSION_STORAGE_KEY_PWA, "true"); // Set session flag
    setTimeout(() => {
      setCanInstall(false);
      setIsVisible(false);
    }, 500); // Match animation duration
  };

  const handleInstallClick = async () => {
    if (!installPrompt) return;

    const result = await installPrompt();
    if (result.outcome === 'accepted') {
      console.log('DreamyDesk PWA installed');
    } else {
      console.log('DreamyDesk PWA installation dismissed');
    }
    setCanInstall(false);
    handleDismiss();
  };
  
  if (!isVisible || isStandalone) {
    return null;
  }

  return (
    <div
      className={cn(
        "fixed bottom-24 left-1/2 -translate-x-1/2 z-50 w-[90vw] max-w-sm rounded-lg bg-card shadow-2xl border p-4",
        isDismissing ? "animate-slide-out-bottom" : "animate-slide-in-bottom"
      )}
    >
      <div className="flex items-center gap-4">
        <DreamyDeskLogo className="w-12 h-12 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="font-bold">Install DreamyDesk App</h3>
          <p className="text-sm text-muted-foreground">
            Get faster access and an improved experience.
          </p>
        </div>
        <Button variant="ghost" size="icon" className="flex-shrink-0" onClick={handleDismiss}>
          <X className="w-5 h-5" />
        </Button>
      </div>
      <div className="mt-4 flex gap-2">
        <Button
          variant="outline"
          className="w-full"
          onClick={handleDismiss}
        >
          Deny
        </Button>
        <Button
          className="w-full font-bold"
          onClick={handleInstallClick}
        >
          <DownloadCloud className="w-5 h-5 mr-2" />
          Install
        </Button>
      </div>
    </div>
  );
}
