
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { createCategory } from "@/services/category.service";
import { ArrowLeft, Loader2, Upload } from "lucide-react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { app } from "@/lib/firebase";


export default function NewCategoryPage() {
    const { toast } = useToast();
    const router = useRouter();
    
    const [name, setName] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    
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
    
    const handleCreateCategory = async () => {
        if (!name) {
            toast({ variant: "destructive", title: "Name is required" });
            return;
        }
        if (!file) {
            toast({ variant: "destructive", title: "Thumbnail is required" });
            return;
        }
        
        setLoading(true);

        try {
            // Upload thumbnail
            const storage = getStorage(app);
            const fileName = `category-thumbnails/${Date.now()}_${file.name}`;
            const storageRef = ref(storage, fileName);
            await uploadBytes(storageRef, file);
            const thumbnailUrl = await getDownloadURL(storageRef);
            
            // Create category
            await createCategory(name, thumbnailUrl);
            
            toast({
                title: "Category Created!",
                description: `The category "${name}" has been created successfully.`,
            });
            router.push("/admin/categories");

        } catch (error) {
             const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
             toast({ variant: "destructive", title: "Error", description: errorMessage });
             setLoading(false);
        }
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
                        <h1 className="text-3xl font-bold font-headline">New Category</h1>
                        <p className="text-muted-foreground">
                            Create a new category for wallpapers.
                        </p>
                    </div>
                </div>
                 <div className="flex gap-2">
                    <Link href="/admin/categories">
                        <Button variant="outline">Cancel</Button>
                    </Link>
                    <Button onClick={handleCreateCategory} disabled={!name || !file || loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Create Category
                    </Button>
                 </div>
            </div>

            <Card className="max-w-2xl">
                <CardHeader>
                    <CardTitle>Category Details</CardTitle>
                    <CardDescription>Provide a name and a thumbnail image for the new category.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                     <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Landscapes"/>
                     </div>
                     <div className="space-y-2">
                        <Label htmlFor="thumbnail">Thumbnail</Label>
                        <Input id="thumbnail" type="file" onChange={handleFileChange} accept="image/*" />
                     </div>
                     {preview && (
                        <div className="relative w-full max-w-sm aspect-video rounded-lg overflow-hidden border">
                            <Image src={preview} alt="Thumbnail preview" fill className="object-cover" sizes="50vw"/>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
