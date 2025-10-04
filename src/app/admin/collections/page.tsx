
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAllCollections, deleteCollection } from "@/services/collection.service";
import { MoreHorizontal, PlusCircle, Trash2, Pencil, Gem } from "lucide-react";
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
import { CuratedCollection } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { getCdnUrl } from "@/lib/cdn";

export default function AdminCollectionsPage() {
  const [collections, setCollections] = useState<CuratedCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [collectionToDelete, setCollectionToDelete] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchCollections = async () => {
      setLoading(true);
      const allCollections = await getAllCollections();
      setCollections(allCollections);
      setLoading(false);
    }
    fetchCollections();
  }, []);

  const handleDelete = async () => {
    if (!collectionToDelete) return;
    try {
        await deleteCollection(collectionToDelete);
        setCollections(collections.filter(c => c.id !== collectionToDelete));
        toast({
            variant: "destructive",
            title: "Collection Deleted",
            description: "The collection has been successfully deleted.",
        });
    } catch (error) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to delete collection.",
        });
    } finally {
        setShowDeleteAlert(false);
        setCollectionToDelete(null);
    }
  };
  
  const openDeleteDialog = (collectionId: string) => {
    setCollectionToDelete(collectionId);
    setShowDeleteAlert(true);
  }

  if (loading) {
    return <CollectionsPageSkeleton />;
  }

  return (
    <>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-headline">Curated Collections</h1>
            <p className="text-muted-foreground">
              Create, edit, and manage wallpaper collections for the homepage.
            </p>
          </div>
          <Link href="/admin/collections/new">
              <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Collection
              </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map((collection) => (
            <Card key={collection.id} className="overflow-hidden">
              <CardHeader className="flex flex-row items-start justify-between">
                  <div>
                      <CardTitle className="flex items-center gap-2">
                        {collection.title}
                        {collection.isPremium && <Badge variant="destructive"><Gem className="w-3 h-3 mr-1"/>Premium</Badge>}
                      </CardTitle>
                      <CardDescription>{collection.description}</CardDescription>
                  </div>
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
                              <Link href={`/admin/collections/${collection.id}/edit`} className="cursor-pointer">
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                              </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => openDeleteDialog(collection.id)} className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer">
                              <Trash2 className="mr-2 h-4 w-4" />
                              <span>Delete</span>
                          </DropdownMenuItem>
                      </DropdownMenuContent>
                  </DropdownMenu>
              </CardHeader>
              <CardContent>
                  <Link href={`/admin/collections/${collection.id}/edit`}>
                    <div className="relative group overflow-hidden rounded-lg aspect-[4/3]">
                        <OptimizedImage
                        alt={collection.title}
                        className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                        src={collection.thumbnailUrl}
                        fill
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent p-4 flex flex-col justify-end">
                            <p className="text-white/90 text-sm">{collection.wallpaperCount} wallpapers</p>
                        </div>
                    </div>
                  </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the collection.
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

function CollectionsPageSkeleton() {
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

    
