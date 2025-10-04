
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAllBlogPosts, deleteBlogPost } from "@/services/blog.service";
import { MoreHorizontal, PlusCircle, Trash2, Pencil, Globe, BookCopy } from "lucide-react";
import OptimizedImage from "@/components/optimized-image";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { BlogPost } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { AspectRatio } from "@/components/ui/aspect-ratio";

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [postToDelete, setPostToDelete] = useState<BlogPost | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      const allPosts = await getAllBlogPosts();
      setPosts(allPosts);
      setLoading(false);
    }
    fetchPosts();
  }, []);

  const handleDelete = async () => {
    if (!postToDelete) return;
    try {
        await deleteBlogPost(postToDelete.id);
        setPosts(posts.filter(c => c.id !== postToDelete.id));
        toast({
            variant: "destructive",
            title: "Blog Post Deleted",
            description: "The post has been successfully deleted.",
        });
    } catch (error) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to delete blog post.",
        });
    } finally {
        setShowDeleteAlert(false);
        setPostToDelete(null);
    }
  };
  
  const openDeleteDialog = (post: BlogPost) => {
    setPostToDelete(post);
    setShowDeleteAlert(true);
  }

  if (loading) {
    return <BlogPageSkeleton />;
  }

  return (
    <>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-headline">Blog Posts</h1>
            <p className="text-muted-foreground">
              Create and manage articles for your website's blog.
            </p>
          </div>
          <Link href="/admin/blog/new">
              <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Post
              </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Card key={post.id} className="overflow-hidden flex flex-col">
              <Link href={`/blog/${post.slug}`} target="_blank" className="block relative group overflow-hidden">
                <AspectRatio ratio={16/9}>
                    <OptimizedImage
                      alt={post.title}
                      className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                      src={post.thumbnailUrl}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                </AspectRatio>
                <div className="absolute top-2 right-2">
                    <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>
                        {post.status === 'published' ? <Globe className="w-3 h-3 mr-1" /> : <BookCopy className="w-3 h-3 mr-1"/>}
                        {post.status}
                    </Badge>
                </div>
              </Link>
              <CardHeader className="flex-grow">
                  <CardTitle className="text-xl">{post.title}</CardTitle>
                  <CardDescription>{post.excerpt}</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-between text-sm text-muted-foreground">
                 <span>{format(new Date(post.createdAt), "PPP")}</span>
                  <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                          <Button
                          aria-haspopup="true"
                          size="icon"
                          variant="ghost"
                          >
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                          </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem asChild>
                              <Link href={`/admin/blog/${post.id}/edit`} className="cursor-pointer">
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                              </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => openDeleteDialog(post)} className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer">
                              <Trash2 className="mr-2 h-4 w-4" />
                              <span>Delete</span>
                          </DropdownMenuItem>
                      </DropdownMenuContent>
                  </DropdownMenu>
              </CardContent>
            </Card>
          ))}
           {posts.length === 0 && (
                <div className="col-span-full text-center py-16 text-muted-foreground border-2 border-dashed rounded-lg">
                    <h2 className="text-xl font-semibold">No Blog Posts Yet</h2>
                    <p className="mt-2">Click "New Post" to create your first article.</p>
                </div>
            )}
        </div>
      </div>
      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the blog post "{postToDelete?.title}".
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
                Continue
            </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function BlogPageSkeleton() {
    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-4 w-80" />
                </div>
                <Skeleton className="h-10 w-36" />
            </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <Skeleton className="h-96 w-full" />
                <Skeleton className="h-96 w-full" />
                <Skeleton className="h-96 w-full" />
             </div>
        </div>
    )
}
