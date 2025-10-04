
"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getBlogPostById, updateBlogPost } from "@/services/blog.service";
import { getAllWallpapers, getWallpapersByIds } from "@/services/wallpaper.service";
import { PlusCircle, Trash2, Search, ArrowLeft, Loader2, Wand2 } from "lucide-react";
import OptimizedImage from "@/components/optimized-image";
import { Input } from "@/components/ui/input";
import { Wallpaper, BlogPost } from "@/lib/types";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { useRouter, useParams, notFound } from "next/navigation";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { app } from "@/lib/firebase";
import { Switch } from "@/components/ui/switch";
import { generateBlogPost } from "@/ai/flows/generate-blog-post";
import ReactMarkdown from 'react-markdown';
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Skeleton } from "@/components/ui/skeleton";


export default function EditBlogPostPage() {
    const { toast } = useToast();
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;
    
    // Form state
    const [blogPost, setBlogPost] = useState<BlogPost | null>(null);
    const [topic, setTopic] = useState("");
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [excerpt, setExcerpt] = useState("");
    const [status, setStatus] = useState<'draft' | 'published'>('draft');
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
    const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
    
    // Wallpaper selection state
    const [selectedWallpapers, setSelectedWallpapers] = useState<Wallpaper[]>([]);
    const [allWallpapers, setAllWallpapers] = useState<Wallpaper[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);

    // Action states
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            try {
                const [postData, allWallpapersData] = await Promise.all([
                    getBlogPostById(id),
                    getAllWallpapers(),
                ]);

                if (!postData) {
                    notFound();
                    return;
                }
                
                const wallpapersInPost = await getWallpapersByIds(postData.wallpaperIds);
                
                setBlogPost(postData);
                setTitle(postData.title);
                setContent(postData.content);
                setExcerpt(postData.excerpt);
                setStatus(postData.status);
                setThumbnailPreview(postData.thumbnailUrl);
                setSelectedWallpapers(wallpapersInPost);
                setAllWallpapers(allWallpapersData);
                setTopic(postData.title); // Use title as a default topic

            } catch (err) {
                 toast({ variant: 'destructive', title: 'Error loading post' });
                 notFound();
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, [id, toast]);

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

    const availableWallpapers = useMemo(() => allWallpapers
      .filter(w => !selectedWallpapers.some(fw => fw.id === w.id))
      .filter(w => 
          w.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (w.tags && w.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))
      ), [allWallpapers, selectedWallpapers, searchQuery]);

    const addWallpaper = (wallpaper: Wallpaper) => {
        setSelectedWallpapers([...selectedWallpapers, wallpaper]);
    };

    const removeWallpaper = (wallpaperId: string) => {
        setSelectedWallpapers(selectedWallpapers.filter(w => w.id !== wallpaperId));
    }

    const handleGeneratePost = async () => {
        if (!topic || selectedWallpapers.length === 0) {
            toast({ variant: 'destructive', title: 'Missing required fields', description: 'Please provide a topic and select at least one wallpaper.'});
            return;
        }
        setIsGenerating(true);
        try {
            const aiResponse = await generateBlogPost({
                topic,
                wallpapers: selectedWallpapers.map(w => ({ id: w.id, title: w.title, description: w.description, aiHint: w.aiHint }))
            });
            setTitle(aiResponse.title);
setContent(aiResponse.content);
            setExcerpt(aiResponse.excerpt);
            toast({ title: 'Content Generated!', description: 'The blog post has been regenerated. Review and save your changes.' });
        } catch (error) {
            toast({ variant: 'destructive', title: 'AI Generation Failed', description: 'Could not generate the blog post. Please try again.' });
        } finally {
            setIsGenerating(false);
        }
    }
    
    const handleSavePost = async () => {
        if (!title || !content || !blogPost) {
            toast({ variant: "destructive", title: "Missing required fields", description: "Title and content are required to save." });
            return;
        }

        setIsSaving(true);
        let finalThumbnailUrl = blogPost.thumbnailUrl;

        try {
            if (thumbnailFile) {
                const storage = getStorage(app);
                const fileName = `blog-thumbnails/${Date.now()}_${thumbnailFile.name}`;
                const storageRef = ref(storage, fileName);
                await uploadBytes(storageRef, thumbnailFile);
                finalThumbnailUrl = await getDownloadURL(storageRef);
            }

            const slug = title.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/[\s-]+/g, '-');

            await updateBlogPost(id, {
                slug,
                title,
                content,
                excerpt,
                thumbnailUrl: finalThumbnailUrl,
                status,
                wallpaperIds: selectedWallpapers.map(w => w.id),
            });
            
            toast({
                title: "Blog Post Updated!",
                description: `The post "${title}" has been saved successfully.`,
            });
            router.push("/admin/blog");
        } catch (error) {
             toast({ variant: "destructive", title: "Error", description: "Failed to save the blog post." });
             setIsSaving(false);
        }
    }

    if (loading) {
        return <BlogPostPageSkeleton />;
    }

    if (!blogPost) {
        return notFound();
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin/blog">
                         <Button variant="outline" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                         </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold font-headline">Edit Blog Post</h1>
                        <p className="text-muted-foreground">
                            Now editing: {blogPost.title}
                        </p>
                    </div>
                </div>
                 <div className="flex gap-2">
                    <Link href="/admin/blog">
                        <Button variant="outline">Cancel</Button>
                    </Link>
                    <Button onClick={handleSavePost} disabled={isSaving || isGenerating}>
                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Save Changes
                    </Button>
                 </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* Left Column */}
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>AI Content Generation</CardTitle>
                            <CardDescription>Regenerate content based on a topic and the selected wallpapers.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="topic">Topic / Prompt</Label>
                                <Input id="topic" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g., Top 10 Dark Themed Wallpapers"/>
                            </div>
                             <Button onClick={handleGeneratePost} disabled={isGenerating || !topic || selectedWallpapers.length === 0} className="w-full">
                                {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                                Regenerate Content
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Featured Wallpapers</CardTitle>
                             <CardDescription>{selectedWallpapers.length} wallpaper(s) selected</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2 max-h-96 overflow-y-auto">
                            {selectedWallpapers.map((wallpaper) => (
                                <div key={wallpaper.id} className="flex items-center gap-2 p-1.5 rounded-md border text-sm">
                                    <div className="relative h-12 w-9 rounded-sm overflow-hidden flex-shrink-0">
                                        <OptimizedImage alt={wallpaper.title} className="object-cover" src={wallpaper.imageUrl} fill sizes="5vw" />
                                    </div>
                                    <p className="flex-1 font-medium truncate">{wallpaper.title}</p>
                                    <Button variant="ghost" size="icon" className="text-destructive h-7 w-7" onClick={() => removeWallpaper(wallpaper.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                            {selectedWallpapers.length === 0 && (
                                <p className="text-center text-muted-foreground py-4 text-xs">Select wallpapers to feature.</p>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Settings</CardTitle>
                        </CardHeader>
                         <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="thumbnail">Change Thumbnail</Label>
                                <Input id="thumbnail" type="file" onChange={handleThumbnailChange} accept="image/*" />
                            </div>
                            {thumbnailPreview && (
                                <div className="relative w-full aspect-video rounded-lg overflow-hidden border">
                                    <OptimizedImage src={thumbnailPreview} alt="Thumbnail preview" fill className="object-cover" sizes="33vw" />
                                </div>
                            )}
                             <div className="flex items-center space-x-2">
                                <Switch
                                    id="status-switch"
                                    checked={status === 'published'}
                                    onCheckedChange={(checked) => setStatus(checked ? 'published' : 'draft')}
                                />
                                <Label htmlFor="status-switch">Published</Label>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                
                {/* Right Column */}
                 <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Blog Post Editor</CardTitle>
                            <CardDescription>Review and edit the content here. The content supports Markdown.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                             <div className="space-y-2">
                                <Label htmlFor="title">Title</Label>
                                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
                             </div>
                             <div className="space-y-2">
                                <Label htmlFor="excerpt">Excerpt</Label>
                                <Textarea id="excerpt" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} />
                             </div>
                             <div className="space-y-2">
                                <Label htmlFor="content">Content (Markdown)</Label>
                                <Textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} className="min-h-[400px] font-mono"/>
                             </div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader>
                            <CardTitle>Live Preview</CardTitle>
                        </CardHeader>
                        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
                            <ReactMarkdown>{content}</ReactMarkdown>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Select Wallpapers</CardTitle>
                            <div className="relative pt-2">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input 
                                    placeholder="Search wallpapers..."
                                    className="pl-10"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </CardHeader>
                        <CardContent className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 max-h-[500px] overflow-y-auto">
                            {availableWallpapers.map((wallpaper) => (
                                <div key={wallpaper.id} className="relative group overflow-hidden rounded-lg cursor-pointer" onClick={() => addWallpaper(wallpaper)}>
                                    <AspectRatio ratio={9 / 16}>
                                        <OptimizedImage
                                            alt={wallpaper.title}
                                            className="object-cover w-full h-full"
                                            src={wallpaper.imageUrl}
                                            fill
                                            sizes="20vw"
                                        />
                                    </AspectRatio>
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-1">
                                        <p className="text-white text-xs text-center">{wallpaper.title}</p>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

function BlogPostPageSkeleton() {
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-64 w-full" />
            </div>
            <div className="lg:col-span-2">
                <Skeleton className="h-[500px] w-full" />
            </div>
        </div>
    </div>
  );
}
