
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { saveWallpaperMetadata } from "@/services/wallpaper.service";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { app } from "@/lib/firebase";
import { Category } from "@/lib/types";
import UploadImagePreview from "./upload/upload-image-preview";
import UploadMetadataForm from "./upload/upload-metadata-form";
import { Loader2, UploadCloud } from "lucide-react";

interface UploadFormProps {
  existingCategories: Category[];
}

type UploadStatus = 'idle' | 'uploading' | 'saving' | 'success' | 'error';


export function UploadForm({ existingCategories }: UploadFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [category, setCategory] = useState("");
  const [isPremium, setIsPremium] = useState(false);
  const [isExclusive, setIsExclusive] = useState(false);
  const [resolution, setResolution] = useState("");

  const [allCategories, setAllCategories] = useState(existingCategories);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [status, setStatus] = useState<UploadStatus>('idle');
  
  const { toast } = useToast();
  const router = useRouter();

   useEffect(() => {
    setAllCategories(existingCategories);
  }, [existingCategories]);

  const resetForm = () => {
    setFile(null);
    setPreview(null);
    setTitle("");
    setDescription("");
    setTags([]);
    setCategory("");
    setIsPremium(false);
    setIsExclusive(false);
    setResolution("");
    setUploadProgress(0);
    setStatus('idle');
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) {
        toast({ variant: "destructive", title: "Missing Image", description: "Please select a file to upload." });
        return;
    }
    if (!title || !category || !resolution) {
        toast({ variant: "destructive", title: "Missing Fields", description: "Please provide a title, category and resolution." });
        return;
    }
    
    setStatus('uploading');
    setUploadProgress(0);

    const storage = getStorage(app);
    const fileName = `wallpapers/${Date.now()}_${file.name}`;
    const storageRef = ref(storage, fileName);
    
    const metadata = {
      contentType: file.type,
      customMetadata: {
        width: resolution.split('x')[0],
        height: resolution.split('x')[1],
      }
    };

    const uploadTask = uploadBytesResumable(storageRef, file, metadata);

    uploadTask.on('state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (error) => {
        console.error("Upload failed", error);
        toast({
            variant: "destructive",
            title: "Upload Failed",
            description: `Could not upload file: ${error.message}`,
        });
        setStatus('error');
      },
      async () => {
        try {
            setStatus('saving');
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            
            await saveWallpaperMetadata({
                title,
                description,
                category,
                tags,
                premium: isPremium,
                isExclusive: isExclusive,
                imageUrl: downloadURL,
                thumbnailUrl: downloadURL, // Set thumbnail to main image initially
                fileName: fileName, // Save the file name for direct access later
                resolution,
                aiHint: tags.slice(0, 2).join(' '),
                downloads: 0,
                likes: 0,
                shares: 0,
                views: 0,
                rating: 0,
                featured: false,
            });
            
            setStatus('success');
            toast({
                title: "Upload Successful!",
                description: `"${title}" has been added.`,
            });
            resetForm();
            router.refresh(); // Refresh server components on the page if needed

        } catch (error) {
            console.error("Failed to save metadata", error);
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            toast({
                variant: "destructive",
                title: "Metadata Save Failed",
                description: `Could not save wallpaper details. ${errorMessage}`,
            });
            setStatus('error');
        }
      }
    );
  }
  
  const isSubmitDisabled = status === 'uploading' || status === 'saving';

  const getButtonText = () => {
    switch (status) {
        case 'uploading':
            return `Uploading... ${Math.round(uploadProgress)}%`;
        case 'saving':
            return 'Saving metadata...';
        default:
            return 'Publish Now';
    }
  }

  return (
      <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-8">
        <fieldset disabled={isSubmitDisabled} className="contents">
            <UploadImagePreview 
                file={file} 
                setFile={setFile} 
                preview={preview} 
                setPreview={setPreview}
                setResolution={setResolution}
                status={status}
                uploadProgress={uploadProgress}
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
                
                <Button type="submit" className="w-full" disabled={isSubmitDisabled || !file}>
                    {isSubmitDisabled ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
                    {getButtonText()}
                </Button>
            </div>
        </fieldset>
      </form>
  );
}
