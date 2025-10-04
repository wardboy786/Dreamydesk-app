
"use client";

import dynamic from 'next/dynamic';
import { Loader } from "@/components/ui/loader";

// This client component is responsible for dynamically loading the HomePageTabs
// with server-side rendering disabled. This is the correct pattern to avoid
// using `ssr: false` directly in a Server Component like the main page.
const HomePageTabs = dynamic(() => import('@/components/home/home-page-tabs'), {
  loading: () => <div className="mt-12"><Loader /></div>,
  ssr: false, // This is allowed here because this is a Client Component
});

export default function HomeLoader() {
  return <HomePageTabs />;
}
