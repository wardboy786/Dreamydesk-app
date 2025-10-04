
'use client';

import { Toaster as UiToaster } from "@/components/ui/toaster";
import { Toaster as HotToaster } from 'react-hot-toast';
import { ThemeProvider } from '@/components/layout/theme-provider';
import { AuthProvider } from '@/hooks/use-auth';
import { InstallPromptProvider } from '@/hooks/use-install-prompt';
import InstallPwaToast from '@/components/install-pwa-toast';
import { usePathname } from 'next/navigation';

export default function AppProviders({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminPath = pathname.startsWith('/admin');

  return (
      <InstallPromptProvider>
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {!isAdminPath && (
              <>
                <InstallPwaToast />
              </>
            )}
            {children}
            <UiToaster />
            <HotToaster position="bottom-center" />
            <div id="portal-container" />
          </ThemeProvider>
        </AuthProvider>
      </InstallPromptProvider>
  );
}
