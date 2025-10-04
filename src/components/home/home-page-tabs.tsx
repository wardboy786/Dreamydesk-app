
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from 'next/navigation';
import { BottomNav } from "@/components/layout/bottom-nav";
import { House, Clock, Gem, LayoutGrid, Menu } from "lucide-react";
import dynamic from "next/dynamic";
import { Loader } from "../ui/loader";

const navItems = [
  { name: 'Home', icon: <House className="w-5 h-5" />, value: 'Home' },
  { name: 'Latest', icon: <Clock className="w-5 h-5" />, value: 'Latest' },
  { name: 'Premium', icon: <Gem className="w-5 h-5" />, value: 'Premium' },
  { name: 'Categories', icon: <LayoutGrid className="w-5 h-5" />, value: 'Categories' },
  { name: 'Menu', icon: <Menu className="w-5 h-5" />, value: 'Menu' },
];

const DynamicLatest = dynamic(() => import('@/components/home/latest-wallpapers'), {
  loading: () => <div className="mt-12"><Loader /></div>,
});
const DynamicPremium = dynamic(() => import('@/components/home/premium-wallpapers'), {
  loading: () => <div className="mt-12"><Loader /></div>,
});
const DynamicCategories = dynamic(() => import('@/components/home/category-grid'), {
  loading: () => <div className="mt-12"><Loader /></div>,
});

/**
 * Renders the content for the currently active tab.
 * Only the active component is mounted and rendered.
 */
function TabContent({ activeTab }: { activeTab: string }) {
  if (activeTab === 'Latest') {
    return <DynamicLatest />;
  }
  if (activeTab === 'Premium') {
    return <DynamicPremium />;
  }
  if (activeTab === 'Categories') {
    return <DynamicCategories />;
  }
  return null; // Home content is handled by the useEffect visibility toggle
}

export default function HomePageTabs() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Safely get the initial tab from the URL, defaulting to 'Home'.
  const initialTab = searchParams.get('tab') || 'Home';
  const [activeTab, setActiveTab] = useState(initialTab);
  
  useEffect(() => {
    // This effect reliably controls the visibility of the server-rendered content.
    const homeContent = document.getElementById('home-content');
    if (homeContent) {
      homeContent.style.display = activeTab === 'Home' ? 'block' : 'none';
    }

    // Update URL without a full page reload for a SPA-like feel.
    const newUrl = activeTab === 'Home' 
        ? window.location.pathname 
        : `${window.location.pathname}?tab=${activeTab}`;
    window.history.replaceState({ ...window.history.state, as: newUrl, url: newUrl }, '', newUrl);

    // Scroll to top when switching to a non-Home tab that renders new content.
    if (activeTab !== 'Home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [activeTab]);

  return (
    <>
      <div className="space-y-8 mt-12">
        {/* Conditionally render the content for the active tab. */}
        <TabContent activeTab={activeTab} />
      </div>

      <BottomNav items={navItems} activeTab={activeTab} setActiveTab={setActiveTab} />
    </>
  );
}
