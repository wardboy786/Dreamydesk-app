
"use client";

import { useState, useEffect } from "react";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { getDownloadsByDateRange, getViewsByDateRange, getLikesByDateRange, getDownloadTrendData, getViewTrendData, getTotalWallpaperCount, getPopularWallpapersInRange } from "@/services/analytics-service";
import { getAllCategories } from "@/services/category.service";
import { Category, Wallpaper } from "@/lib/types";
import { DashboardSkeleton } from "./dashboard-skeleton";
import { StatsCards } from "@/components/admin/stats-cards";
import { PerformanceTrendChart } from "@/components/admin/analytics/performance-trend-chart";
import { CategoryDistributionChart } from "@/components/admin/analytics/category-distribution-chart";
import { WallpaperTable } from "@/components/admin/wallpaper-table";

interface DashboardAnalyticsProps {
    date: DateRange | undefined;
}

export default function DashboardAnalytics({ date }: DashboardAnalyticsProps) {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ totalWallpapers: 0, totalViews: 0, totalDownloads: 0, totalLikes: 0 });
    const [allCategories, setAllCategories] = useState<Category[]>([]);
    const [downloadTrendData, setDownloadTrendData] = useState<{ date: string; count: number }[]>([]);
    const [viewTrendData, setViewTrendData] = useState<{ date: string; count: number }[]>([]);
    const [topWallpapers, setTopWallpapers] = useState<Wallpaper[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            if (!date?.from || !date?.to) {
                return;
            }
            setLoading(true);
            const from = date.from;
            const to = date.to;

            try {
                const [
                    totalWallpaperCount,
                    categoriesData,
                    downloadsData,
                    viewsData,
                    likesData,
                    dlTrendData,
                    vwTrendData,
                    popularWallpapersData,
                ] = await Promise.all([
                    getTotalWallpaperCount(),
                    getAllCategories(),
                    getDownloadsByDateRange(from, to),
                    getViewsByDateRange(from, to),
                    getLikesByDateRange(from, to),
                    getDownloadTrendData(from, to),
                    getViewTrendData(from, to),
                    getPopularWallpapersInRange(from, to, 5),
                ]);

                setAllCategories(categoriesData);

                setStats({
                    totalWallpapers: totalWallpaperCount,
                    totalViews: viewsData,
                    totalDownloads: downloadsData.totalDownloads, // Use totalDownloads from the object
                    totalLikes: likesData,
                });

                setDownloadTrendData(dlTrendData);
                setViewTrendData(vwTrendData);
                setTopWallpapers(popularWallpapersData);
            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [date]);

    if (loading) {
        return <DashboardSkeleton />;
    }
    
    const categoryDistribution = allCategories.map(category => ({
        name: category.name,
        value: category.wallpaperCount,
    })).filter(c => c.value > 0);


    return (
        <>
            <StatsCards stats={stats} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <PerformanceTrendChart downloadsData={downloadTrendData} viewsData={viewTrendData} />
                <CategoryDistributionChart data={categoryDistribution} />
            </div>

            <WallpaperTable
                title={`Top Wallpapers (${date?.from ? format(date.from, "LLL dd") : ''} - ${date?.to ? format(date.to, "LLL dd") : ''})`}
                description="Most popular wallpapers in the selected date range based on a weighted score."
                wallpapers={topWallpapers}
                showDownloads
                showLikes
                showViews
            />
        </>
    );
}
