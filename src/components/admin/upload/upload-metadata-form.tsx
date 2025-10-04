
"use client";

import { useState, useEffect } from "react";
import { generateWallpaperMetadata } from "@/ai/flows/generate-wallpaper-metadata";
import { createCategory } from "@/services/category.service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, X, PlusCircle, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Category } from "@/lib/types";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { app } from "@/lib/firebase";

/**
 * Resizes an image from a data URI to a smaller JPEG data URI.
 * @param dataUri The original image data URI.
 * @param maxWidth The maximum width of the resized image.
 * @returns A promise that resolves to the new, smaller data URI.
 */
function resizeImageForAI(dataUri: string, maxWidth = 512): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        return reject(new Error('Failed to get canvas context'));
      }

      const aspectRatio = img.height / img.width;
      canvas.width = maxWidth;
      canvas.height = maxWidth * aspectRatio;

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      // Export as a reasonably high-quality JPEG for analysis
      resolve(canvas.toDataURL('image/jpeg', 0.85));
    };
    img.onerror = (err) => {
        console.error("Image loading failed for resizing:", err);
        reject(new Error("Image could not be loaded for resizing."));
    };
    img.src = dataUri;
  });
}


interface UploadMetadataFormProps {
    title: string;
    setTitle: (title: string) => void;
    description: string;
    setDescription: (description: string) => void;
    tags: string[];
    setTags: (tags: string[]) => void;
    category: string;
    setCategory: (category: string) => void;
    resolution: string;
    isPremium: boolean;
    setIsPremium: (isPremium: boolean) => void;
    isExclusive: boolean;
    setIsExclusive: (isExclusive: boolean) => void;
    allCategories: Category[];
    setAllCategories: (categories: Category[]) => void;
    preview: string | null;
    isSubmitDisabled: boolean;
}

export default function UploadMetadataForm({
    title, setTitle,
    description, setDescription,
    tags, setTags,
    category, setCategory,
    resolution,
    isPremium, setIsPremium,
    isExclusive, setIsExclusive,
    allCategories, setAllCategories,
    preview,
    isSubmitDisabled
}: UploadMetadataFormProps) {
    const [currentTag, setCurrentTag] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState("");
    const [newCategoryFile, setNewCategoryFile] = useState<File | null>(null);
    const [isCreatingCategory, setIsCreatingCategory] = useState(false);
    const { toast } = useToast();

    // Enforce business logic: if exclusive is true, premium must be true.
    useEffect(() => {
        if (isExclusive) {
            setIsPremium(true);
        }
    }, [isExclusive, setIsPremium]);

    const handleExclusiveChange = (checked: boolean) => {
        setIsExclusive(checked);
        if (checked) {
            setIsPremium(true);
        }
    };

    const handleMetadataGeneration = async () => {
        if (!preview) {
            toast({
                variant: "destructive",
                title: "No Image Selected",
                description: "Please select an image before generating metadata.",
            });
            return;
        }
        setIsGenerating(true);
        setTitle("");
        setDescription("");
        setTags([]);
        setCategory("");
        try {
            // Resize the image before sending it to the AI
            const resizedImageUri = await resizeImageForAI(preview);

            const result = await generateWallpaperMetadata({ photoDataUri: resizedImageUri, existingCategories: allCategories.map(c => c.name) });
            setTitle(result.title);
            setDescription(result.description);
            setTags(result.tags);
            if (allCategories.some(c => c.name === result.category)) {
                setCategory(result.category);
            }
        } catch (error) {
            console.error("Error generating metadata:", error);
            toast({
                variant: "destructive",
                title: "AI Metadata Failed",
                description: "Could not generate metadata. Please check your API key and try again.",
            });
        } finally {
            setIsGenerating(false);
        }
    };

    const addTag = (e?: React.MouseEvent<HTMLButtonElement> | React.KeyboardEvent<HTMLInputElement>) => {
        if (e) e.preventDefault();
        const cleanTag = currentTag.trim().toLowerCase();
        if (cleanTag && !tags.includes(cleanTag)) {
            setTags([...tags, cleanTag]);
        }
        setCurrentTag("");
    };

    const handleAddCustomTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            addTag(e);
        }
    };

    const removeTag = (tagToRemove: string) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    const handleAddNewCategory = async () => {
        const cleanCategory = newCategoryName.trim();
        if (!cleanCategory) {
            toast({ variant: "destructive", title: "Category name is required" });
            return;
        }
        if (!newCategoryFile) {
            toast({ variant: "destructive", title: "Category thumbnail is required" });
            return;
        }

        setIsCreatingCategory(true);
        try {
            // Upload thumbnail
            const storage = getStorage(app);
            const fileName = `category-thumbnails/${Date.now()}_${newCategoryFile.name}`;
            const storageRef = ref(storage, fileName);
            await uploadBytes(storageRef, newCategoryFile);
            const thumbnailUrl = await getDownloadURL(storageRef);

            // Create category in Firestore
            const newCat = await createCategory(cleanCategory, thumbnailUrl);
            
            setAllCategories([...allCategories, newCat]);
            setCategory(newCat.name);
            toast({
                title: "Category Added",
                description: `Successfully added "${cleanCategory}".`,
            });

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            toast({ variant: "destructive", title: "Failed to add category", description: errorMessage });
        } finally {
            setNewCategoryName("");
            setNewCategoryFile(null);
            setIsAddCategoryOpen(false);
            setIsCreatingCategory(false);
        }
    }

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>Metadata</CardTitle>
                    <CardDescription>Click the button to use AI to fill in the fields below.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <Button type="button" onClick={handleMetadataGeneration} disabled={isGenerating || !preview || isSubmitDisabled} className="w-full">
                        {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                        Generate with AI
                    </Button>

                    <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input id="title" placeholder="e.g., 'Sunset Over the Ocean'" required value={title} onChange={(e) => setTitle(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" placeholder="A brief description of the wallpaper." value={description} onChange={(e) => setDescription(e.target.value)} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <div className="flex gap-2">
                            <Select value={category} onValueChange={setCategory} required>
                                <SelectTrigger id="category" className="flex-1">
                                    <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {allCategories.map((cat) => (
                                        <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button type="button" variant="outline" onClick={() => setIsAddCategoryOpen(true)}>
                                <PlusCircle className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Tags</Label>
                        <div className="flex flex-wrap gap-2 p-2 border rounded-md min-h-[40px]">
                            {tags.map((tag) => (
                                <Badge key={tag} variant="secondary">
                                    {tag}
                                    <button type="button" onClick={() => removeTag(tag)} className="ml-1 rounded-full hover:bg-muted-foreground/20 p-0.5">
                                        <X className="h-3 w-3" />
                                    </button>
                                </Badge>
                            ))}
                            <Input
                                value={currentTag}
                                onChange={(e) => setCurrentTag(e.target.value)}
                                onKeyDown={handleAddCustomTag}
                                placeholder="Add tags..."
                                className="flex-1 border-none outline-none ring-0 focus-visible:ring-0 shadow-none p-0 h-auto"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="resolution">Resolution</Label>
                        <Input id="resolution" placeholder="e.g., 1920x1080" required value={resolution} readOnly />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center space-x-2">
                            <Switch
                                id="premium-switch"
                                checked={isPremium}
                                onCheckedChange={setIsPremium}
                                disabled={isExclusive}
                            />
                            <Label htmlFor="premium-switch">Premium Wallpaper</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Switch
                                id="exclusive-switch"
                                checked={isExclusive}
                                onCheckedChange={handleExclusiveChange}
                            />
                            <Label htmlFor="exclusive-switch">Exclusive Wallpaper</Label>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={isAddCategoryOpen} onOpenChange={setIsAddCategoryOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Category</DialogTitle>
                        <DialogDescription>
                            Create a new category to organize your wallpapers.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="new-category-name">Category Name</Label>
                            <Input
                                id="new-category-name"
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                placeholder="e.g., 'Sci-Fi'"
                            />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="new-category-image">Category Thumbnail</Label>
                             <Input 
                                id="new-category-image" 
                                type="file" 
                                onChange={(e) => setNewCategoryFile(e.target.files?.[0] || null)} 
                                accept="image/*" 
                             />
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="secondary" disabled={isCreatingCategory}>Cancel</Button>
                        </DialogClose>
                        <Button type="button" onClick={handleAddNewCategory} disabled={isCreatingCategory || !newCategoryName || !newCategoryFile}>
                            {isCreatingCategory && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Add Category
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
