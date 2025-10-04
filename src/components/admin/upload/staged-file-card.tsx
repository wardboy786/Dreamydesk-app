
"use client";

import { useState } from "react";
import OptimizedImage from "@/components/optimized-image";
import type { StagedFile } from "@/app/admin/upload/page";
import type { Category } from "@/lib/types";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CheckCircle, CheckCircle2, Circle, HelpCircle, Loader2, PlusCircle, Sparkles, Trash2, UploadCloud, X, AlertTriangle } from "lucide-react";

interface StagedFileCardProps {
    stagedFile: StagedFile;
    allCategories: Category[];
    onGenerateMetadata: (id: string) => void;
    onUpdate: (id: string, updates: Partial<StagedFile>) => void;
    onQueueForPublish: (id: string) => void;
    onCreateCategory: (name: string, file: File) => Promise<Category | null>;
    onDelete: (id: string) => void;
}

export default function StagedFileCard({ stagedFile, allCategories, onGenerateMetadata, onUpdate, onQueueForPublish, onCreateCategory, onDelete }: StagedFileCardProps) {
    
    const [currentTag, setCurrentTag] = useState("");
    const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState("");
    const [newCategoryFile, setNewCategoryFile] = useState<File | null>(null);
    const [isCreatingCategory, setIsCreatingCategory] = useState(false);
    
    const isMetadataReady = stagedFile.status === 'ready';
    const isPending = stagedFile.status === 'pending';
    const isGenerating = stagedFile.status === 'generating';
    const isUploading = stagedFile.status === 'uploading';
    const isProcessingDims = stagedFile.status === 'processing-dims';

    const addTag = (e?: React.MouseEvent | React.KeyboardEvent) => {
        if (e) e.preventDefault();
        const cleanTag = currentTag.trim().toLowerCase();
        if (cleanTag && !stagedFile.tags.includes(cleanTag)) {
            onUpdate(stagedFile.id, { tags: [...stagedFile.tags, cleanTag] });
        }
        setCurrentTag("");
    };

    const handleAddCustomTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            addTag(e);
        }
    };

    const removeTag = (tagToRemove: string) => {
        onUpdate(stagedFile.id, { tags: stagedFile.tags.filter(tag => tag !== tagToRemove) });
    };

    const handleAddNewCategory = async () => {
        if (!newCategoryName.trim() || !newCategoryFile) return;
        setIsCreatingCategory(true);
        const newCat = await onCreateCategory(newCategoryName, newCategoryFile);
        if (newCat) {
            onUpdate(stagedFile.id, { category: newCat.name });
            setIsAddCategoryOpen(false);
            setNewCategoryName('');
            setNewCategoryFile(null);
        }
        setIsCreatingCategory(false);
    }

    const getStatusIndicator = () => {
        if (isUploading) {
            return <div className="flex items-center gap-2 text-blue-500"><Loader2 className="h-4 w-4 animate-spin" /> Uploading ({Math.round(stagedFile.progress)}%)...</div>
        }
        if (isProcessingDims) {
            return <div className="flex items-center gap-2 text-blue-500"><Loader2 className="h-4 w-4 animate-spin" /> Processing...</div>
        }
        if (isGenerating) {
            return <div className="flex items-center gap-2 text-purple-500"><Sparkles className="h-4 w-4 animate-spin" /> Generating AI Data...</div>
        }
        if (isMetadataReady) {
            return <div className="flex items-center gap-2 text-green-600"><CheckCircle className="h-4 w-4" /> Metadata Ready</div>
        }
        if (stagedFile.error) {
             return <div className="flex items-center gap-2 text-destructive"><AlertTriangle className="h-4 w-4" /> Error: {stagedFile.error}</div>
        }
        return <div className="flex items-center gap-2 text-amber-600"><Circle className="h-4 w-4" /> Metadata Required</div>
    };
    
    return (
        <Card className="overflow-hidden">
            <CardHeader className="flex-row items-center justify-between bg-muted/50 p-4">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="relative w-16 h-20 rounded-md overflow-hidden flex-shrink-0 bg-black/10">
                        {stagedFile.imageUrl && <OptimizedImage src={stagedFile.imageUrl} alt={stagedFile.file.name} fill className="object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-medium truncate" title={stagedFile.file.name}>{stagedFile.file.name}</p>
                        <div className="text-sm font-medium">{getStatusIndicator()}</div>
                    </div>
                </div>
                 <div className="flex items-center gap-2">
                    <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => onDelete(stagedFile.id)}
                        aria-label="Remove file"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button
                        onClick={() => onQueueForPublish(stagedFile.id)}
                        disabled={!isMetadataReady}
                    >
                        <CheckCircle2 className="mr-2 h-4 w-4" /> Queue for Publishing
                    </Button>
                 </div>
            </CardHeader>
            <CardContent className="p-0 space-y-4">
                <Accordion type="single" collapsible disabled={isUploading || isGenerating || isProcessingDims}>
                     <AccordionItem value="item-1" className="border-none">
                        <AccordionTrigger className="text-sm font-medium px-4 py-2 hover:bg-muted/50">
                            Edit Metadata
                        </AccordionTrigger>
                        <AccordionContent>
                           <div className="grid md:grid-cols-2 gap-6 p-4 pt-2 border-t">
                                <div className="space-y-4">
                                    <Button type="button" onClick={() => onGenerateMetadata(stagedFile.id)} disabled={isGenerating || isUploading || isMetadataReady || isProcessingDims} className="w-full">
                                        {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                                        Generate with AI
                                    </Button>
                                     <div className="space-y-2">
                                        <Label htmlFor={`title-${stagedFile.id}`}>Title</Label>
                                        <Input id={`title-${stagedFile.id}`} value={stagedFile.title} onChange={(e) => onUpdate(stagedFile.id, { title: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor={`description-${stagedFile.id}`}>Description</Label>
                                        <Textarea id={`description-${stagedFile.id}`} value={stagedFile.description} onChange={(e) => onUpdate(stagedFile.id, { description: e.target.value })} />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor={`category-${stagedFile.id}`}>Category</Label>
                                        <div className="flex gap-2">
                                            <Select value={stagedFile.category} onValueChange={(value) => onUpdate(stagedFile.id, { category: value })}>
                                                <SelectTrigger id={`category-${stagedFile.id}`}>
                                                    <SelectValue placeholder="Select a category" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {allCategories.map((cat) => (
                                                        <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <Button type="button" variant="outline" size="icon" onClick={() => setIsAddCategoryOpen(true)}>
                                                <PlusCircle className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                     <div className="space-y-2">
                                        <Label>Tags</Label>
                                        <div className="flex flex-wrap gap-2 p-2 border rounded-md min-h-[40px] bg-background">
                                            {stagedFile.tags.map((tag) => (
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
                                                className="flex-1 border-none outline-none ring-0 focus-visible:ring-0 shadow-none p-0 h-auto bg-transparent"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            id={`premium-switch-${stagedFile.id}`}
                                            checked={stagedFile.isPremium}
                                            onCheckedChange={(checked) => onUpdate(stagedFile.id, { isPremium: checked })}
                                        />
                                        <Label htmlFor={`premium-switch-${stagedFile.id}`}>Premium Wallpaper</Label>
                                    </div>
                                </div>
                           </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </CardContent>
            
            <Dialog open={isAddCategoryOpen} onOpenChange={setIsAddCategoryOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Category</DialogTitle>
                        <DialogDescription>Create a new category to organize your wallpapers.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="new-category-name">Category Name</Label>
                            <Input id="new-category-name" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="new-category-image">Category Thumbnail</Label>
                            <Input id="new-category-image" type="file" onChange={(e) => setNewCategoryFile(e.target.files?.[0] || null)} accept="image/*" />
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild><Button type="button" variant="secondary" disabled={isCreatingCategory}>Cancel</Button></DialogClose>
                        <Button type="button" onClick={handleAddNewCategory} disabled={isCreatingCategory || !newCategoryName || !newCategoryFile}>
                            {isCreatingCategory && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Add Category
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
}
