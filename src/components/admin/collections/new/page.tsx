
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createCollection } from "@/services/collection.service";
import { getAllWallpapers } from "@/services/wallpaper.service";
import { PlusCircle, GripVertical, Trash2, Search, ArrowLeft, Loader2 } from "lucide-react";
import OptimizedImage from "@/components/optimized-image";
import { Input } from "@/components/ui/input";
import { Wallpaper } from "@/lib/types";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { app } from "@/lib/firebase";
import { Switch } from "@/components/ui/switch";


export default function NewCollectionPage() {
    const { toast } = useToast();
    const router = useRouter();
    
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
    const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
    const [isPremium, setIsPremium] = useState(false);
    const [collectionWallpapers, setCollectionWallpapers] = useState<Wallpaper[]>([]);
    const [allWallpapers, setAllWallpapers] = useState<Wallpaper[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

     useEffect(() => {
        const fetchWallpapers = async () => {
            setLoading(true);
            const wallpapers = await getAllWallpapers();
            setAllWallpapers(wallpapers);
            setLoading(false);
        };
        fetchWallpapers();
    }, []);

    const handleThumbnailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (selectedFile) {
            setThumbnailFile(selectedFile);
            const reader = new FileReader();
            reader.onloadend = () => {
                setThumbnailPreview(reader.result as string);
            };
            reader.readAsDataURL(selectedFile);
        }
    };

    const availableWallpapers = allWallpapers
      .filter(w => !collectionWallpapers.some(fw => fw.id === w.id))
      .filter(w => 
          w.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          w.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );

    const addWallpaper = (wallpaper: Wallpaper) => {
        setCollectionWallpapers([...collectionWallpapers, wallpaper]);
    };

    const removeWallpaper = (wallpaperId: string) => {
        const newCollection = collectionWallpapers.filter(w => w.id !== wallpaperId);
        setCollectionWallpapers(newCollection);
    }
    
    const handleCreateCollection = async () => {
        if (!title) {
            toast({ variant: "destructive", title: "Title is required" });
            return;
        }
         if (!thumbnailFile) {
            toast({ variant: "destructive", title: "Thumbnail image is required" });
            return;
        }

        setSaving(true);
        try {
            // Upload thumbnail
            const storage = getStorage(app);
            const fileName = `collection-thumbnails/${Date.now()}_${thumbnailFile.name}`;
            const storageRef = ref(storage, fileName);
            await uploadBytes(storageRef, thumbnailFile);
            const thumbnailUrl = await getDownloadURL(storageRef);

            await createCollection({
                title,
                description,
                thumbnailUrl: thumbnailUrl,
                wallpaperCount: collectionWallpapers.length,
                wallpaperIds: collectionWallpapers.map(w => w.id),
                isPremium,
            });
            toast({
                title: "Collection Created!",
                description: `The collection "${title}" has been created successfully.`,
            });
            router.push("/admin/collections");
        } catch (error) {
             toast({ variant: "destructive", title: "Error", description: "Failed to create collection." });
             setSaving(false);
        }
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin/collections">
                         <Button variant="outline" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                         </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold font-headline">New Collection</h1>
                        <p className="text-muted-foreground">
                            Create a new curated collection for the homepage.
                        </p>
                    </div>
                </div>
                 <div className="flex gap-2">
                    <Link href="/admin/collections">
                        <Button variant="outline">Cancel</Button>
                    </Link>
                    <Button onClick={handleCreateCollection} disabled={!title || loading || saving}>
                        {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Create Collection
                    </Button>
                 </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Collection Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                             <div className="space-y-2">
                                <Label htmlFor="title">Title</Label>
                                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Moody Mondays"/>
                             </div>
                             <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="A short description..." />
                             </div>
                            <div className="space-y-2">
                                <Label htmlFor="thumbnail">Thumbnail</Label>
                                <Input id="thumbnail" type="file" onChange={handleThumbnailChange} accept="image/*" />
                            </div>
                            {thumbnailPreview && (
                                <div className="relative w-full max-w-sm aspect-video rounded-lg overflow-hidden border">
                                    <OptimizedImage src={thumbnailPreview} alt="Thumbnail preview" fill className="object-cover" sizes="50vw" />
                                </div>
                            )}
                             <div className="flex items-center space-x-2">
                                <Switch
                                    id="premium-switch"
                                    checked={isPremium}
                                    onCheckedChange={setIsPremium}
                                />
                                <Label htmlFor="premium-switch">Premium Collection</Label>
                            </div>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader>
                            <CardTitle>Wallpapers in Collection</CardTitle>
                             <CardDescription>({collectionWallpapers.length}) wallpapers selected</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {collectionWallpapers.map((wallpaper) => (
                                    <div key={wallpaper.id} className="flex items-center gap-4 p-2 rounded-lg border bg-background">
                                        <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                                        <div className="relative h-16 w-12 rounded-md overflow-hidden flex-shrink-0">
                                            <OptimizedImage
                                                alt={wallpaper.title}
                                                className="object-cover"
                                                src={wallpaper.imageUrl}
                                                fill
                                                sizes="10vw"
                                                width={48}
                                                height={64}
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium truncate">{wallpaper.title}</p>
                                        </div>
                                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => removeWallpaper(wallpaper.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                                {collectionWallpapers.length === 0 && (
                                    <p className="text-center text-muted-foreground py-4">Add some wallpapers from the right.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
                 <div className="lg:col-span-2">
                     <Card>
                        <CardHeader>
                            <CardTitle>Add Wallpapers</CardTitle>
                            <CardDescription>Select wallpapers to add to the collection.</CardDescription>
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
                        <CardContent className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4">
                            {availableWallpapers.map((wallpaper) => (
                                <div key={wallpaper.id} className="relative group overflow-hidden rounded-lg">
                                    <OptimizedImage
                                        alt={wallpaper.title}
                                        className="object-cover w-full aspect-[9/16]"
                                        height={160}
                                        src={wallpaper.imageUrl}
                                        width={90}
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
            </div>
        </div>
    );
}
