
import type { Metadata } from 'next';
import './globals.css';
import AppProviders from './app-providers'; // Import the new client component

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://dreamydesk.co.in';

// Metadata is defined outside the component for static export
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: '/',
  },
  title: {
    default: 'DreamyDesk - Stunning HD Wallpapers for Your Desktop & Mobile',
    template: '%s - DreamyDesk',
  },
  description: 'Discover and download thousands of stunning, high-quality wallpapers for your desktop, tablet, or mobile phone. Curated collections, categories, and new additions daily. The world\'s number 1 wallpaper website.',
  keywords: ['wallpapers', 'desktop backgrounds', '4k wallpapers', 'hd wallpapers', 'mobile wallpapers', 'free wallpapers', 'backgrounds', 'cool wallpapers'],
  openGraph: {
    title: 'DreamyDesk - Stunning HD Wallpapers for Your Desktop & Mobile',
    description: 'The ultimate destination for high-quality, curated wallpapers for all your devices.',
    url: siteUrl,
    siteName: 'DreamyDesk',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'DreamyDesk Homepage',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DreamyDesk - Stunning HD Wallpapers',
    description: 'Discover and download thousands of beautiful wallpapers for your desktop and mobile devices.',
    images: [`${siteUrl}/og-image.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/manifest.json',
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico?v=1" sizes="any" />
        {/* Preconnect to critical origins */}
        <link rel="preconnect" href="https://dreamydesk-fab2b.firebaseapp.com" />
        <link rel="preconnect" href="https://www.googleapis.com" />
      </head>
      <body>
        <AppProviders>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
