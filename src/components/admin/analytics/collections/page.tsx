
"use client";

import { useState, useEffect } from "react";
import { getCollectionAnalytics, CollectionAnalyticsData } from "@/services/analytics-service";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Layers, Download, Eye, Star } from "lucide-react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import OptimizedImage from "@/components/optimized-image";

export default function CollectionAnalyticsPage() {
    const [analytics, setAnalytics] = useState<CollectionAnalyticsData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getCollectionAnalytics()
            .then(setAnalytics)
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold font-headline flex items-center gap-2">
                    <Layers className="w-8 h-8 text-primary" />
                    Collection Analytics
                </h1>
                <p className="text-muted-foreground">
                    Analyze the performance of your curated collections.
                </p>
            </div>

            <Card>
                 <CardHeader>
                    <CardTitle>Collection Performance</CardTitle>
                    <CardDescription>
                        Collections are sorted by the number of views. This data reflects actions taken *within* a collection.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                         <div className="space-y-4">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="flex items-center space-x-4 p-2">
                                    <Skeleton className="h-16 w-16 rounded-md" />
                                    <div className="space-y-2 flex-1">
                                        <Skeleton className="h-4 w-3/4" />
                                        <Skeleton className="h-4 w-1/2" />
                                    </div>
                                    <div className="flex gap-4">
                                        <Skeleton className="h-6 w-16" />
                                        <Skeleton className="h-6 w-16" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Collection</TableHead>
                                    <TableHead className="text-center">Views</TableHead>
                                    <TableHead className="text-center">Total Downloads</TableHead>
                                    <TableHead>Top Wallpaper</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {analytics.map((collection) => (
                                    <TableRow key={collection.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-4">
                                                <OptimizedImage
                                                    alt={collection.title}
                                                    className="aspect-square rounded-md object-cover"
                                                    height="64"
                                                    src={collection.thumbnailUrl}
                                                    width="64"
                                                />
                                                <div>
                                                    <Link href={`/admin/collections/${collection.id}/edit`} className="font-medium hover:underline">{collection.title}</Link>
                                                    {collection.isPremium && <Badge variant="destructive" className="ml-2">Premium</Badge>}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center font-bold">
                                            <div className="flex items-center justify-center gap-1.5">
                                                <Eye className="w-4 h-4 text-muted-foreground" />
                                                {collection.views}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center font-bold">
                                             <div className="flex items-center justify-center gap-1.5">
                                                <Download className="w-4 h-4 text-muted-foreground" />
                                                {collection.totalDownloads}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {collection.topWallpaper ? (
                                                <div className="flex items-center gap-2">
                                                     <OptimizedImage
                                                        alt={collection.topWallpaper.title}
                                                        className="aspect-square rounded-md object-cover"
                                                        height="40"
                                                        src={collection.topWallpaper.thumbnailUrl || collection.topWallpaper.imageUrl}
                                                        width="40"
                                                    />
                                                    <div>
                                                        <p className="font-medium truncate text-sm">{collection.topWallpaper.title}</p>
                                                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                            <Download className="w-3 h-3" />
                                                            {collection.topWallpaper.collectionDownloads} downloads
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground text-sm">N/A</span>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {analytics.length === 0 && (
                                     <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center">
                                            No collection data available yet. Views will be tracked as users interact with the homepage.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
