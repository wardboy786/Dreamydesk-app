
"use client";

import { WallpaperTable } from "@/components/admin/wallpaper-table";
import { getAllWallpapers, deleteWallpaper as deleteWallpaperService } from "@/services/wallpaper.service";
import { getAllCategories } from "@/services/category.service";
import { Wallpaper, Category } from "@/lib/types";
import { useEffect, useState, useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";

export default function WallpapersPage() {
  const [wallpapers, setWallpapers] = useState<Wallpaper[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [allWallpapers, allCategories] = await Promise.all([
            getAllWallpapers(),
            getAllCategories()
        ]);
        setWallpapers(allWallpapers);
        setCategories(allCategories);
      } catch (error) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to fetch wallpapers or categories.",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [toast]);

  const handleDeleteWallpaper = async (wallpaperId: string) => {
    try {
        await deleteWallpaperService(wallpaperId);
        setWallpapers(prevWallpapers => prevWallpapers.filter(w => w.id !== wallpaperId));
        toast({
            variant: "destructive",
            title: "Wallpaper Deleted",
            description: "The wallpaper has been successfully deleted.",
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        toast({
            variant: "destructive",
            title: "Error Deleting Wallpaper",
            description: errorMessage,
        });
    }
  };

  const filteredWallpapers = useMemo(() => {
    return wallpapers
      .filter(wallpaper => {
        // Filter by category
        if (categoryFilter !== "all" && wallpaper.category !== categoryFilter) {
          return false;
        }
        // Filter by search term
        if (searchTerm && !wallpaper.title.toLowerCase().includes(searchTerm.toLowerCase())) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        // Robust date parsing to prevent client-side crashes
        const dateA = a.createdAt instanceof Date ? a.createdAt : new Date((a.createdAt as any)?._seconds * 1000 || a.createdAt);
        const dateB = b.createdAt instanceof Date ? b.createdAt : new Date((b.createdAt as any)?._seconds * 1000 || b.createdAt);
        
        // Final check for validity before sorting
        if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) {
            return 0; // Don't sort if dates are invalid
        }

        return dateB.getTime() - dateA.getTime();
      });
  }, [wallpapers, categoryFilter, searchTerm]);

  const freeWallpapers = filteredWallpapers.filter(w => !w.premium);
  const premiumWallpapers = filteredWallpapers.filter(w => w.premium);


  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline">Wallpapers</h1>
          <p className="text-muted-foreground">Manage all uploaded wallpapers.</p>
        </div>
      </div>

       <Card>
        <CardContent className="p-4 flex flex-col sm:flex-row gap-4">
            <Input 
                placeholder="Search by title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
            />
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(category => (
                        <SelectItem key={category.id} value={category.name}>
                            {category.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </CardContent>
      </Card>

      {loading ? (
        <WallpaperTableSkeleton />
      ) : (
        <Tabs defaultValue="all" className="w-full">
            <TabsList>
                <TabsTrigger value="all">All ({filteredWallpapers.length})</TabsTrigger>
                <TabsTrigger value="free">Free ({freeWallpapers.length})</TabsTrigger>
                <TabsTrigger value="premium">Premium ({premiumWallpapers.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="all">
                 <WallpaperTable 
                    title="All Wallpapers" 
                    wallpapers={filteredWallpapers} 
                    showActions 
                    onDelete={handleDeleteWallpaper}
                />
            </TabsContent>
             <TabsContent value="free">
                 <WallpaperTable 
                    title="Free Wallpapers" 
                    wallpapers={freeWallpapers} 
                    showActions 
                    onDelete={handleDeleteWallpaper}
                />
            </TabsContent>
             <TabsContent value="premium">
                 <WallpaperTable 
                    title="Premium Wallpapers" 
                    wallpapers={premiumWallpapers} 
                    showActions 
                    onDelete={handleDeleteWallpaper}
                />
            </TabsContent>
        </Tabs>
      )}
    </div>
  );
}


function WallpaperTableSkeleton() {
    return (
        <div className="space-y-4">
            <div className="flex gap-4">
                <Skeleton className="h-10 w-full max-w-sm" />
                <Skeleton className="h-10 w-48" />
            </div>
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-48 w-full" />
        </div>
    )
}
