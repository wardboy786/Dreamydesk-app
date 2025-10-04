
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams, notFound } from "next/navigation";
import { getWallpaperById, updateWallpaper } from "@/services/wallpaper.service";
import { getAllCategories } from "@/services/category.service";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Wallpaper, Category } from "@/lib/types";
import UploadImagePreview from "@/components/admin/upload/upload-image-preview";
import UploadMetadataForm from "@/components/admin/upload/upload-metadata-form";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

type EditStatus = 'idle' | 'saving' | 'success' | 'error';

export default function EditWallpaperPage() {
    const { toast } = useToast();
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [wallpaper, setWallpaper] = useState<Wallpaper | null>(null);
    const [originalCategory, setOriginalCategory] = useState("");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [tags, setTags] = useState<string[]>([]);
    const [category, setCategory] = useState("");
    const [isPremium, setIsPremium] = useState(false);
    const [isExclusive, setIsExclusive] = useState(false);
    const [resolution, setResolution] = useState("");
    const [preview, setPreview] = useState<string | null>(null);

    const [allCategories, setAllCategories] = useState<Category[]>([]);
    const [status, setStatus] = useState<EditStatus>('idle');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        
        const fetchInitialData = async () => {
            setLoading(true);
            try {
                const [wallpaperData, categoriesData] = await Promise.all([
                    getWallpaperById(id, false), // don't increment view on edit
                    getAllCategories()
                ]);

                if (!wallpaperData) {
                    notFound();
                    return;
                }

                setWallpaper(wallpaperData);
                setOriginalCategory(wallpaperData.category);
                setTitle(wallpaperData.title);
                setDescription(wallpaperData.description);
                setTags(wallpaperData.tags);
                setCategory(wallpaperData.category);
                setIsPremium(wallpaperData.premium);
                setIsExclusive(wallpaperData.isExclusive || false);
                setResolution(wallpaperData.resolution);
                setPreview(wallpaperData.imageUrl);
                setAllCategories(categoriesData);

            } catch (error) {
                toast({ variant: 'destructive', title: "Error", description: "Failed to load wallpaper data." });
                notFound();
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, [id, toast]);

    const handleSaveChanges = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!wallpaper) return;

        setStatus('saving');

        const updatedData: Partial<Wallpaper> = {
            title,
            description,
            tags,
            category,
            premium: isPremium,
            isExclusive: isExclusive,
            aiHint: tags.slice(0, 2).join(' '),
        };
        
        try {
            await updateWallpaper(wallpaper.id, originalCategory, updatedData);
            setStatus('success');
            toast({
                title: "Update Successful!",
                description: `"${title}" has been updated.`,
            });
            router.push('/admin/wallpapers');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            toast({
                variant: "destructive",
                title: "Update Failed",
                description: errorMessage,
            });
            setStatus('error');
        }
    };
    
    if (loading) {
        return <EditPageSkeleton />;
    }

    if (!wallpaper) {
        return notFound();
    }
    
    const isSubmitDisabled = status === 'saving';

    return (
        <form onSubmit={handleSaveChanges} className="space-y-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin/wallpapers">
                         <Button variant="outline" size="icon" type="button">
                            <ArrowLeft className="h-4 w-4" />
                         </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold font-headline">Edit Wallpaper</h1>
                        <p className="text-muted-foreground">
                            Now editing &quot;{wallpaper.title}&quot;
                        </p>
                    </div>
                </div>
                 <div className="flex gap-2">
                    <Link href="/admin/wallpapers">
                        <Button variant="outline" type="button">Cancel</Button>
                    </Link>
                    <Button type="submit" disabled={isSubmitDisabled}>
                        {isSubmitDisabled && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                 </div>
            </div>

            <fieldset disabled={isSubmitDisabled} className="grid md:grid-cols-2 gap-8">
                <UploadImagePreview 
                    file={null} // Not allowing file change on edit page
                    setFile={() => {}} 
                    preview={preview} 
                    setPreview={setPreview}
                    setResolution={setResolution}
                    status={'idle'}
                    uploadProgress={0}
                    disabled={true} // Disable file input on edit page
                />
                <div className="space-y-6">
                    <UploadMetadataForm 
                        title={title} setTitle={setTitle}
                        description={description} setDescription={setDescription}
                        tags={tags} setTags={setTags}
                        category={category} setCategory={setCategory}
                        resolution={resolution}
                        isPremium={isPremium} setIsPremium={setIsPremium}
                        isExclusive={isExclusive} setIsExclusive={setIsExclusive}
                        allCategories={allCategories} setAllCategories={setAllCategories}
                        preview={preview}
                        isSubmitDisabled={isSubmitDisabled}
                    />
                </div>
            </fieldset>
        </form>
    );
}

function EditPageSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-10" />
                <div className="space-y-2">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-64" />
                </div>
            </div>
            <div className="flex gap-2">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-24" />
            </div>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="aspect-[9/16] w-full" />
          </div>
           <div className="space-y-6">
              <Skeleton className="h-[500px] w-full" />
              <Skeleton className="h-10 w-full" />
           </div>
        </div>
    </div>
  )
}
