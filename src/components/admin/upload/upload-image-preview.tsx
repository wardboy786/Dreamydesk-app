
"use client";

import OptimizedImage from "@/components/optimized-image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";

interface UploadImagePreviewProps {
    file: File | null;
    setFile: (file: File | null) => void;
    preview: string | null;
    setPreview: (preview: string | null) => void;
    setResolution: (resolution: string) => void;
    status: 'idle' | 'uploading' | 'saving' | 'success' | 'error';
    uploadProgress: number;
    disabled?: boolean;
}

export default function UploadImagePreview({
    setFile,
    preview,
    setPreview,
    setResolution,
    status,
    uploadProgress,
    disabled = false,
}: UploadImagePreviewProps) {

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            const reader = new FileReader();
            reader.onloadend = () => {
                const dataUri = reader.result as string;
                setPreview(dataUri);
                const img = document.createElement('img');
                img.onload = () => {
                    setResolution(`${img.naturalWidth}x${img.naturalHeight}`);
                };
                img.src = dataUri;
            };
            reader.readAsDataURL(selectedFile);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Wallpaper Image</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label htmlFor="picture">Select File</Label>
                    <Input id="picture" type="file" onChange={handleFileChange} accept="image/*" disabled={disabled} />
                </div>
                {preview && (
                    <div className="relative w-full aspect-[9/16] rounded-lg overflow-hidden border">
                        <OptimizedImage src={preview} alt="Image preview" fill className="object-cover" sizes="50vw" />
                    </div>
                )}
                {status === 'uploading' && (
                    <div className="space-y-2 pt-4">
                        <Progress value={uploadProgress} />
                        <p className="text-sm text-muted-foreground text-center">Uploading... {Math.round(uploadProgress)}%</p>
                    </div>
                )}
                {status === 'saving' && (
                    <div className="flex items-center justify-center space-x-2 pt-4">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <p className="text-sm text-muted-foreground text-center">Finalizing and saving...</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
