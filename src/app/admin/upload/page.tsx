
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { getStorage, ref, uploadBytesResumable, getDownloadURL, UploadTask } from "firebase/storage";
import { app } from "@/lib/firebase";
import { v4 as uuidv4 } from 'uuid';
import { generateWallpaperMetadata } from "@/ai/flows/generate-wallpaper-metadata";
import { saveWallpaperMetadata } from "@/services/wallpaper.service";
import { getAllCategories, createCategory } from "@/services/category.service";
import { Wallpaper, Category } from "@/lib/types";

import { UploadCloud, CheckCircle2, Loader2, FileUp, ListChecks, Sparkles, Trash2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import StagedFileCard from "@/components/admin/upload/staged-file-card";
import QueuedFileCard from "@/components/admin/upload/queued-file-card";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import UploadMetadataForm from "@/components/admin/upload/upload-metadata-form";
import OptimizedImage from "@/components/optimized-image";

// Represents a file currently being uploaded or staged for processing.
export interface StagedFile {
    id: string;
    file: File;
    status: 'uploading' | 'processing-dims' | 'pending' | 'generating' | 'ready';
    progress: number;
    error?: string;
    // --- Wallpaper Data ---
    title: string;
    description: string;
    tags: string[];
    category: string;
    isPremium: boolean;
    resolution: string;
    imageUrl: string;
    fileName: string;
}

// Represents a wallpaper that is fully processed and ready to be published.
export type QueuedWallpaper = Omit<Wallpaper, 'id' | 'createdAt' | 'updatedAt' | 'featured' | 'downloads' | 'likes' | 'shares' | 'views' | 'rating'>;

// Type for storing simplified state in localStorage (without File and UploadTask objects)
type SerializableStagedFile = Omit<StagedFile, 'file' | 'task'> & {
    fileNameForLookup: string; // The original file.name
};

// This map will hold the non-serializable parts of the state (File objects and UploadTasks)
const fileObjectMap = new Map<string, { file: File; task?: UploadTask }>();

export default function ManualBatchUploadPage() {
    const { toast } = useToast();
    
    // State for files that are uploaded but not yet fully processed with metadata.
    const [stagedFiles, setStagedFiles] = useState<StagedFile[]>([]);
    
    // State for wallpapers that are ready to be published.
    const [publishQueue, setPublishQueue] = useState<QueuedWallpaper[]>([]);
    const [selectedToPublish, setSelectedToPublish] = useState<string[]>([]);

    const [editingWallpaper, setEditingWallpaper] = useState<QueuedWallpaper | null>(null);

    const [allCategories, setAllCategories] = useState<Category[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [isGeneratingAll, setIsGeneratingAll] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);

    // --- State Persistence Logic ---
    useEffect(() => {
        // Load state from localStorage on initial mount
        try {
            const savedStagedFiles = localStorage.getItem('stagedFiles');
            const savedPublishQueue = localStorage.getItem('publishQueue');
            
            if (savedStagedFiles) {
                const parsedStagedFiles: SerializableStagedFile[] = JSON.parse(savedStagedFiles);
                // We can only restore files that haven't been fully processed yet.
                // We cannot resume an active "uploading" state.
                const restorableFiles = parsedStagedFiles.map(sf => ({ ...sf, status: 'pending' as const, progress: 0, file: new File([], sf.fileNameForLookup) }));
                setStagedFiles(restorableFiles);
            }
            if (savedPublishQueue) {
                setPublishQueue(JSON.parse(savedPublishQueue));
            }
        } catch (error) {
            console.error("Failed to load state from localStorage", error);
        }
        
        getAllCategories().then(setAllCategories);
    }, []);

    useEffect(() => {
        // Save state to localStorage whenever it changes
        try {
            const serializableStagedFiles: SerializableStagedFile[] = stagedFiles.map(({ file, task, ...rest }) => ({...rest, fileNameForLookup: file.name}));
            localStorage.setItem('stagedFiles', JSON.stringify(serializableStagedFiles));
            localStorage.setItem('publishQueue', JSON.stringify(publishQueue));
        } catch (error) {
            console.error("Failed to save state to localStorage", error);
        }
    }, [stagedFiles, publishQueue]);


    // --- Core Logic ---

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = event.target.files;
        if (!selectedFiles) return;

        setIsUploading(true);
        
        const newUploads = Array.from(selectedFiles).map(file => {
            const id = uuidv4();
            const uniqueFileName = `${Date.now()}_${file.name}`;
            const filePath = `wallpapers/${uniqueFileName}`;
            const storage = getStorage(app);
            const storageRef = ref(storage, filePath);
            const uploadTask = uploadBytesResumable(storageRef, file);
            
            const newStagedFile: StagedFile = {
                id, file, status: 'uploading', progress: 0,
                title: '', description: '', tags: [], category: '', isPremium: false,
                resolution: '', imageUrl: '', fileName: filePath,
            };

            fileObjectMap.set(id, { file, task: uploadTask });
            
            uploadTask.on('state_changed',
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    setStagedFiles(prev => prev.map(f => f.id === id ? { ...f, progress } : f));
                },
                (error) => {
                    console.error("Upload failed:", error);
                    fileObjectMap.delete(id);
                    setStagedFiles(prev => prev.map(f => f.id === id ? { ...f, status: 'pending', error: 'Upload failed' } : f));
                },
                async () => {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    setStagedFiles(prev => prev.map(f => f.id === id ? { ...f, status: 'processing-dims', imageUrl: downloadURL, progress: 100 } : f));
                }
            );

            return newStagedFile;
        });

        setStagedFiles(prev => [...prev, ...newUploads]);
    };
    
    useEffect(() => {
        const filesToProcess = stagedFiles.filter(f => f.status === 'processing-dims' && f.imageUrl);
        if (filesToProcess.length > 0) {
            filesToProcess.forEach(fileToProcess => {
                const img = new Image();
                img.src = fileToProcess.imageUrl;
                img.onload = () => {
                    const resolution = `${img.naturalWidth}x${img.naturalHeight}`;
                    setStagedFiles(prev => prev.map(f => f.id === fileToProcess.id ? { ...f, status: 'pending', resolution } : f));
                };
                 img.onerror = () => {
                    setStagedFiles(prev => prev.map(f => f.id === fileToProcess.id ? { ...f, status: 'pending', error: 'Could not load image to get dimensions.' } : f));
                }
            });
        }

        const allTasksDone = stagedFiles.every(f => f.progress === 100 || f.error);
        if (allTasksDone) {
            setIsUploading(false);
        }

    }, [stagedFiles]);

    const handleGenerateMetadata = async (id: string) => {
        const fileToProcess = stagedFiles.find(f => f.id === id);
        if (!fileToProcess || !fileToProcess.imageUrl) return;

        setStagedFiles(prev => prev.map(f => f.id === id ? { ...f, status: 'generating' } : f));
        try {
            const result = await generateWallpaperMetadata({ 
                photoDataUri: fileToProcess.imageUrl, 
                existingCategories: allCategories.map(c => c.name) 
            });
            
            setStagedFiles(prev => prev.map(f => f.id === id ? { 
                ...f, 
                status: 'ready',
                title: result.title,
                description: result.description,
                tags: result.tags,
                category: allCategories.some(c => c.name === result.category) ? result.category : '',
            } : f));

        } catch (error) {
            toast({ variant: 'destructive', title: 'AI Metadata Failed' });
            setStagedFiles(prev => prev.map(f => f.id === id ? { ...f, status: 'pending', error: 'AI failed' } : f));
        }
    };

    const handleGenerateAll = async () => {
        setIsGeneratingAll(true);
        const pendingFiles = stagedFiles.filter(f => f.status === 'pending');
        for (const file of pendingFiles) {
            // Check if generation is still active before processing next file
            if (!isGeneratingAll) break; 
            await handleGenerateMetadata(file.id);
        }
        setIsGeneratingAll(false);
    };

    const stopGeneratingAll = () => {
        setIsGeneratingAll(false);
    };
    
    const handleUpdateStagedFile = (id: string, updates: Partial<StagedFile>) => {
        setStagedFiles(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
    }
    
    const handleDeleteStagedFile = (id: string) => {
        const fileToDelete = stagedFiles.find(f => f.id === id);
        if (fileToDelete) {
            const fileObjects = fileObjectMap.get(id);
            if (fileObjects?.task) {
                fileObjects.task.cancel();
            }
            fileObjectMap.delete(id);
            setStagedFiles(prev => prev.filter(f => f.id !== id));
        }
    }

    const handleDeleteQueuedFile = (fileName: string) => {
        setPublishQueue(prev => prev.filter(w => w.fileName !== fileName));
        setSelectedToPublish(prev => prev.filter(fn => fn !== fileName));
    };

    const handleQueueForPublish = (id: string) => {
        const fileToQueue = stagedFiles.find(f => f.id === id);
        if (!fileToQueue) return;

        const wallpaperData: QueuedWallpaper = {
            title: fileToQueue.title,
            description: fileToQueue.description,
            imageUrl: fileToQueue.imageUrl,
            fileName: fileToQueue.fileName,
            thumbnailUrl: fileToQueue.imageUrl,
            resolution: fileToQueue.resolution,
            aiHint: fileToQueue.tags.slice(0, 2).join(' '),
            category: fileToQueue.category,
            tags: fileToQueue.tags,
            premium: fileToQueue.isPremium,
        };

        setPublishQueue(prev => [...prev, wallpaperData]);
        setStagedFiles(prev => prev.filter(f => f.id !== id));
        fileObjectMap.delete(id);
    };
    
    const handlePublishSelected = async () => {
        if (selectedToPublish.length === 0) return;
        setIsPublishing(true);

        const wallpapersToPublish = publishQueue.filter(w => selectedToPublish.includes(w.fileName));
        
        try {
            for (const wallpaper of wallpapersToPublish) {
                await saveWallpaperMetadata(wallpaper);
            }
            toast({ title: "Success!", description: `${wallpapersToPublish.length} wallpaper(s) published.` });
            
            // Remove published items from the queue
            setPublishQueue(prev => prev.filter(w => !selectedToPublish.includes(w.fileName)));
            setSelectedToPublish([]);
        } catch (error) {
            toast({ variant: "destructive", title: "Publish Failed", description: "Could not save wallpapers." });
        } finally {
            setIsPublishing(false);
        }
    }
    
     const handleCreateNewCategory = async (name: string, imageFile: File): Promise<Category | null> => {
        try {
            const storage = getStorage(app);
            const fileName = `category-thumbnails/${Date.now()}_${imageFile.name}`;
            const storageRef = ref(storage, fileName);
            await uploadBytesResumable(storageRef, imageFile);
            const thumbnailUrl = await getDownloadURL(storageRef);

            const newCat = await createCategory(name, thumbnailUrl);
            setAllCategories(prev => [...prev, newCat]);
            toast({ title: "Category Added" });
            return newCat;
        } catch (error) {
            toast({ variant: 'destructive', title: 'Failed to create category' });
            return null;
        }
    };

    const handleUpdateQueuedFile = (updates: Partial<QueuedWallpaper>) => {
        if (!editingWallpaper) return;
        setPublishQueue(prev => prev.map(w => 
            w.fileName === editingWallpaper.fileName ? { ...w, ...updates } : w
        ));
    };

    const handleSaveQueuedFileEdit = () => {
        setEditingWallpaper(null);
        toast({ title: "Update Saved", description: "Changes to the queued wallpaper have been saved." });
    };


    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold font-headline flex items-center gap-2">
                        <UploadCloud className="w-8 h-8 text-primary" />
                        Batch Upload
                    </h1>
                    <p className="text-muted-foreground">
                        Upload images, generate metadata manually, and publish in bulk.
                    </p>
                </div>
            </div>

            {/* --- UPLOAD AREA --- */}
            <Card>
                <CardHeader>
                    <CardTitle>1. Upload Images</CardTitle>
                    <CardDescription>Select multiple images to begin. They will appear in the staging area below.</CardDescription>
                </CardHeader>
                <CardContent>
                     <div className="relative border-2 border-dashed border-muted-foreground/30 rounded-lg p-8 text-center hover:border-primary transition-colors">
                        <FileUp className="mx-auto h-12 w-12 text-muted-foreground" />
                        <p className="mt-4 text-sm text-muted-foreground">Drag and drop files here, or click to select.</p>
                        <input
                            type="file"
                            multiple
                            onChange={handleFileChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            accept="image/png, image/jpeg, image/webp"
                            disabled={isUploading}
                        />
                    </div>
                    {isUploading && <Progress value={stagedFiles.reduce((acc, f) => acc + f.progress, 0) / stagedFiles.length} className="w-full mt-4" />}
                </CardContent>
            </Card>
            
            {/* --- STAGING AREA --- */}
             <Card>
                <CardHeader>
                     <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>2. Staging Area ({stagedFiles.length})</CardTitle>
                            <CardDescription>Generate metadata for your uploaded images. Once ready, queue them for publishing.</CardDescription>
                        </div>
                         <div>
                            {isGeneratingAll ? (
                                <Button variant="destructive" onClick={stopGeneratingAll}>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Stop Generation
                                </Button>
                            ) : (
                                <Button onClick={handleGenerateAll} disabled={isUploading || stagedFiles.filter(f => f.status === 'pending').length === 0}>
                                    <Sparkles className="mr-2 h-4 w-4" />
                                    Generate All ({stagedFiles.filter(f => f.status === 'pending').length})
                                </Button>
                            )}
                        </div>
                    </div>
                </CardHeader>
                 <CardContent>
                    {stagedFiles.length > 0 ? (
                        <div className="space-y-4">
                        {stagedFiles.map(file => (
                            <StagedFileCard 
                                key={file.id}
                                stagedFile={file}
                                allCategories={allCategories}
                                onGenerateMetadata={() => handleGenerateMetadata(file.id)}
                                onUpdate={handleUpdateStagedFile}
                                onQueueForPublish={() => handleQueueForPublish(file.id)}
                                onCreateCategory={handleCreateNewCategory}
                                onDelete={() => handleDeleteStagedFile(file.id)}
                            />
                        ))}
                        </div>
                    ) : (
                        <div className="flex items-center justify-center py-16 border-2 border-dashed rounded-lg">
                            <p className="text-muted-foreground">Upload images to see them here.</p>
                        </div>
                    )}
                 </CardContent>
            </Card>

            <Separator />
            
            {/* --- PUBLISHING QUEUE --- */}
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><ListChecks />Publishing Queue ({publishQueue.length})</CardTitle>
                    <CardDescription>Select the wallpapers you want to make live and publish them.</CardDescription>
                     <div className="flex items-center gap-2 pt-2">
                        <Button onClick={handlePublishSelected} disabled={isPublishing || selectedToPublish.length === 0}>
                            {isPublishing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Publish Selected ({selectedToPublish.length})
                        </Button>
                    </div>
                </CardHeader>
                 <CardContent>
                 {publishQueue.length > 0 ? (
                    <div className="space-y-4">
                    {publishQueue.map(wallpaper => (
                       <QueuedFileCard 
                            key={wallpaper.fileName}
                            wallpaper={wallpaper}
                            isSelected={selectedToPublish.includes(wallpaper.fileName)}
                            onSelectionChange={(fileName, checked) => {
                                setSelectedToPublish(prev => 
                                    checked ? [...prev, fileName] : prev.filter(fn => fn !== fileName)
                                );
                            }}
                            onDelete={() => handleDeleteQueuedFile(wallpaper.fileName)}
                            onEdit={() => setEditingWallpaper(wallpaper)}
                       />
                    ))}
                    </div>
                ) : (
                     <div className="flex items-center justify-center py-16 border-2 border-dashed rounded-lg">
                        <p className="text-muted-foreground">Queue wallpapers from the staging area to publish them.</p>
                    </div>
                )}
                 </CardContent>
            </Card>

            {/* --- EDIT DIALOG --- */}
            <Dialog open={!!editingWallpaper} onOpenChange={(open) => !open && setEditingWallpaper(null)}>
                <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>Edit Queued Wallpaper</DialogTitle>
                        <DialogDescription>
                           Make final changes to &quot;{editingWallpaper?.title}&quot; before publishing.
                        </DialogDescription>
                    </DialogHeader>
                    {editingWallpaper && (
                        <div className="grid md:grid-cols-2 gap-8 overflow-y-auto pr-4 py-4">
                           <UploadMetadataForm
                                title={editingWallpaper.title}
                                setTitle={(title) => handleUpdateQueuedFile({ title })}
                                description={editingWallpaper.description}
                                setDescription={(description) => handleUpdateQueuedFile({ description })}
                                tags={editingWallpaper.tags}
                                setTags={(tags) => handleUpdateQueuedFile({ tags })}
                                category={editingWallpaper.category}
                                setCategory={(category) => handleUpdateQueuedFile({ category })}
                                resolution={editingWallpaper.resolution}
                                isPremium={editingWallpaper.premium}
                                setIsPremium={(isPremium) => handleUpdateQueuedFile({ premium: isPremium })}
                                allCategories={allCategories}
                                setAllCategories={setAllCategories}
                                preview={editingWallpaper.imageUrl}
                                isSubmitDisabled={false}
                            />
                             <div className="space-y-4">
                                <h3 className="text-lg font-medium">Image Preview</h3>
                                <div className="relative w-full aspect-[9/16] rounded-lg overflow-hidden border">
                                    <OptimizedImage src={editingWallpaper.imageUrl} alt="Image preview" fill className="object-cover" sizes="50vw" />
                                </div>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditingWallpaper(null)}>Cancel</Button>
                        <Button onClick={handleSaveQueuedFileEdit}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
