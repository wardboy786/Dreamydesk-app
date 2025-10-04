
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, Image as ImageIcon, Upload, Star, Layers, LayoutGrid, LogOut, Bell, Users, BarChart, FileUp, FilePlus, Download, CheckSquare, Newspaper } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem
} from "@/components/ui/sidebar";
import React from "react";
import { DreamyDeskLogo } from "../layout/dreamy-desk-logo";

interface AdminSidebarProps {
    onLogout: () => void;
}

export function AdminSidebar({ onLogout }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await onLogout();
    router.push('/'); // Redirect to homepage after logout
  }

  const isAnalyticsActive = pathname.startsWith('/admin/analytics');
  const isUploadActive = pathname.startsWith('/admin/upload');

  return (
    <Sidebar className="dark:bg-gray-950" side="left" collapsible="icon">
        <SidebarHeader>
             <Link href="/" className="flex items-center gap-2">
                <DreamyDeskLogo />
                <span className="text-xl font.headline font-bold">DreamyDesk</span>
            </Link>
        </SidebarHeader>
        <SidebarContent>
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname === '/admin'} tooltip={{children: 'Dashboard'}}>
                      <Link href="/admin">
                        <Home />
                        <span>Dashboard</span>
                      </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isAnalyticsActive} tooltip={{children: 'Analytics'}}>
                       <Link href="/admin/analytics/downloads">
                          <BarChart />
                          <span>Analytics</span>
                       </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/wallpapers')} tooltip={{children: 'Wallpapers'}}>
                      <Link href="/admin/wallpapers">
                          <ImageIcon />
                          <span>Wallpapers</span>
                      </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/categories')} tooltip={{children: 'Categories'}}>
                      <Link href="/admin/categories">
                          <LayoutGrid />
                          <span>Categories</span>
                      </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                   <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/collections')} tooltip={{children: 'Collections'}}>
                      <Link href="/admin/collections">
                          <Layers />
                          <span>Collections</span>
                      </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/blog')} tooltip={{children: 'Blog'}}>
                      <Link href="/admin/blog">
                          <Newspaper />
                          <span>Blog</span>
                      </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/featured')} tooltip={{children: 'Featured'}}>
                      <Link href="/admin/featured">
                          <Star />
                          <span>Featured</span>
                      </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton isActive={isUploadActive} tooltip={{children: 'Upload'}}>
                        <Upload />
                        <span>Upload</span>
                    </SidebarMenuButton>
                     <SidebarMenuSub>
                        <SidebarMenuSubItem>
                            <SidebarMenuSubButton asChild isActive={pathname === '/admin/upload/single'}>
                               <Link href="/admin/upload/single">
                                    Single Upload
                               </Link>
                            </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                         <SidebarMenuSubItem>
                             <SidebarMenuSubButton asChild isActive={pathname === '/admin/upload'}>
                                <Link href="/admin/upload">
                                    Batch Upload
                                </Link>
                             </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                    </SidebarMenuSub>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
            <SidebarMenu>
                <SidebarMenuItem>
                     <SidebarMenuButton onClick={handleLogout} tooltip={{children: 'Logout'}}>
                        <LogOut />
                        <span>Logout</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarFooter>
    </Sidebar>
  );
}
