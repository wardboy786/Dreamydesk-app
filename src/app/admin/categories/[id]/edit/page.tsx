
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams, notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getCategoryById, updateCategory } from "@/services/category.service";
import { ArrowLeft, Loader2, Upload } from "lucide-react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { app } from "@/lib/firebase";
import { Category } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";


export default function EditCategoryPage() {
    const { toast } = useToast();
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;
    
    const [category, setCategory] = useState<Category | null>(null);
    const [name, setName] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    useEffect(() => {
        if (!id) return;
        setLoading(true);
        getCategoryById(id)
            .then(cat => {
                if (!cat) {
                    notFound();
                    return;
                }
                setCategory(cat);
                setName(cat.name);
                setPreview(cat.imageUrl);
                setLoading(false);
            })
            .catch(() => {
                toast({ variant: 'destructive', title: "Error", description: "Failed to load category" });
                notFound();
            })
    }, [id, toast]);
    
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(selectedFile);
        }
    };
    
    const handleSaveChanges = async () => {
        if (!name) {
            toast({ variant: "destructive", title: "Name is required" });
            return;
        }
        
        setSaving(true);
        let newImageUrl: string | undefined = undefined;

        try {
            if (file) {
                // Upload new thumbnail if one was selected
                const storage = getStorage(app);
                const fileName = `category-thumbnails/${Date.now()}_${file.name}`;
                const storageRef = ref(storage, fileName);
                await uploadBytes(storageRef, file);
                newImageUrl = await getDownloadURL(storageRef);
            }
            
            // Update category
            await updateCategory(id, name, newImageUrl);
            
            toast({
                title: "Category Updated!",
                description: `The category "${name}" has been updated successfully.`,
            });
            router.push("/admin/categories");

        } catch (error) {
             const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
             toast({ variant: "destructive", title: "Error", description: errorMessage });
             setSaving(false);
        }
    }
    
    if (loading) {
        return <EditCategoryPageSkeleton />;
    }

    if (!category) {
        return notFound();
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin/categories">
                         <Button variant="outline" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                         </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold font-headline">Edit Category</h1>
                        <p className="text-muted-foreground">
                            Editing the &quot;{category.name}&quot; category.
                        </p>
                    </div>
                </div>
                 <div className="flex gap-2">
                    <Link href="/admin/categories">
                        <Button variant="outline">Cancel</Button>
                    </Link>
                    <Button onClick={handleSaveChanges} disabled={!name || saving}>
                        {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                 </div>
            </div>

            <Card className="max-w-2xl">
                <CardHeader>
                    <CardTitle>Category Details</CardTitle>
                    <CardDescription>Update the name and thumbnail image for the category.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                     <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Landscapes"/>
                     </div>
                     <div className="space-y-2">
                        <Label htmlFor="thumbnail">Change Thumbnail</Label>
                        <Input id="thumbnail" type="file" onChange={handleFileChange} accept="image/*" />
                     </div>
                     {preview && (
                        <div className="relative w-full max-w-sm aspect-video rounded-lg overflow-hidden border">
                            <Image src={preview} alt="Thumbnail preview" fill className="object-cover" sizes="50vw" />
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

function EditCategoryPageSkeleton() {
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
            <div className="max-w-2xl">
                <Skeleton className="h-72 w-full" />
            </div>
        </div>
    );
}
