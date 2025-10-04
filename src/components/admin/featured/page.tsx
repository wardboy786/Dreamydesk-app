
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getFeaturedWallpapers, getAllWallpapers, setFeaturedWallpapers } from "@/services/wallpaper.service";
import { PlusCircle, GripVertical, Trash2, Search } from "lucide-react";
import OptimizedImage from "@/components/optimized-image";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Wallpaper } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export default function FeaturedPage() {
    const [featured, setFeatured] = useState<Wallpaper[]>([]);
    const [allWallpapers, setAllWallpapers] = useState<Wallpaper[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        const fetchWallpapers = async () => {
            setLoading(true);
            try {
                const [featuredData, allData] = await Promise.all([
                    getFeaturedWallpapers(50), // Fetch more to be safe
                    getAllWallpapers()
                ]);
                setFeatured(featuredData);
                setAllWallpapers(allData);
            } catch (error) {
                toast({ variant: "destructive", title: "Error", description: "Failed to load wallpapers." });
            } finally {
                setLoading(false);
            }
        };
        fetchWallpapers();
    }, [toast]);

    const availableWallpapers = allWallpapers
      .filter(w => !featured.some(fw => fw.id === w.id))
      .filter(w => 
          w.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          w.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );

    const addWallpaper = (wallpaper: Wallpaper) => {
        setFeatured([...featured, wallpaper]);
    };

    const removeWallpaper = (wallpaperId: string) => {
        setFeatured(featured.filter(w => w.id !== wallpaperId));
    }

    const handleSaveChanges = async () => {
        try {
            await setFeaturedWallpapers(featured.map(w => w.id));
            toast({ title: "Success", description: "Featured wallpapers updated successfully." });
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Failed to save changes." });
        }
    }

    if (loading) {
        return <FeaturedPageSkeleton />;
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold font-headline">Featured Wallpapers</h1>
                    <p className="text-muted-foreground">
                        Manage the wallpapers that appear in the homepage carousel.
                    </p>
                </div>
                 <div className="flex gap-2">
                    <Button variant="outline">Cancel</Button>
                    <Button onClick={handleSaveChanges}>
                        Save Changes
                    </Button>
                 </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Carousel Wallpapers</CardTitle>
                    <CardDescription>Drag and drop to reorder. Add or remove wallpapers below.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {featured.map((wallpaper) => (
                            <div key={wallpaper.id} className="flex items-center gap-4 p-2 rounded-lg border bg-background">
                                <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                                <div className="relative h-16 w-12 rounded-md overflow-hidden flex-shrink-0">
                                    <OptimizedImage
                                        alt={wallpaper.title}
                                        className="object-cover"
                                        src={wallpaper.imageUrl}
                                        fill
                                        sizes="10vw"
                                    />
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium truncate">{wallpaper.title}</p>
                                    <p className="text-sm text-muted-foreground">{wallpaper.category}</p>
                                </div>
                                {wallpaper.premium && <Badge variant="destructive">Premium</Badge>}
                                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => removeWallpaper(wallpaper.id)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                         {featured.length === 0 && (
                            <p className="text-center text-muted-foreground py-4">No featured wallpapers yet. Add some below!</p>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Card>
                 <CardHeader>
                    <CardTitle>Add to Carousel</CardTitle>
                    <CardDescription>Select wallpapers from the list to add them to the featured carousel.</CardDescription>
                    <div className="relative pt-2">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Search wallpapers by title or tag..."
                            className="pl-10"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </CardHeader>
                 <CardContent className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {availableWallpapers.map((wallpaper) => (
                         <div key={wallpaper.id} className="relative group overflow-hidden rounded-lg">
                            <OptimizedImage
                                alt={wallpaper.title}
                                className="object-cover w-full aspect-[9/16]"
                                height={1920}
                                src={wallpaper.imageUrl}
                                width={1080}
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Button size="sm" variant="secondary" onClick={() => addWallpaper(wallpaper)}>
                                    <PlusCircle className="mr-2 h-4 w-4"/> Add
                                </Button>
                            </div>
                        </div>
                    ))}
                 </CardContent>
                 {availableWallpapers.length === 0 && searchQuery && (
                     <CardContent>
                        <p className="text-center text-muted-foreground">No wallpapers found for "{searchQuery}".</p>
                    </CardContent>
                 )}
            </Card>
        </div>
    );
}

function FeaturedPageSkeleton() {
    return (
        <div className="space-y-8 animate-pulse">
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-4 w-80" />
                </div>
                 <div className="flex gap-2">
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-10 w-24" />
                </div>
            </div>
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-96 w-full" />
        </div>
    );
}
