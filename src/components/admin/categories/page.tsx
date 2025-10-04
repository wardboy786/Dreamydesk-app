
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getAllCategories, deleteCategory } from "@/services/category.service";
import { MoreHorizontal, PlusCircle, Trash2, Pencil } from "lucide-react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Category } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      const allCategories = await getAllCategories();
      setCategories(allCategories);
      setLoading(false);
    }
    fetchCategories();
  }, []);

  const handleDelete = async () => {
    if (!categoryToDelete) return;
    try {
        await deleteCategory(categoryToDelete.id);
        setCategories(categories.filter(c => c.id !== categoryToDelete.id));
        toast({
            variant: "destructive",
            title: "Category Deleted",
            description: `The category "${categoryToDelete.name}" has been successfully deleted.`,
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        toast({
            variant: "destructive",
            title: "Error",
            description: errorMessage,
        });
    } finally {
        setShowDeleteAlert(false);
        setCategoryToDelete(null);
    }
  };

  const openDeleteDialog = (category: Category) => {
    if (category.wallpaperCount > 0) {
        toast({
            variant: "destructive",
            title: "Deletion Failed",
            description: "Cannot delete a category that is in use by wallpapers.",
        });
        return;
    }
    setCategoryToDelete(category);
    setShowDeleteAlert(true);
  }

  if (loading) {
    return <CategoriesPageSkeleton />;
  }

  return (
    <>
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline">Categories</h1>
          <p className="text-muted-foreground">
            Create, edit, and manage wallpaper categories.
          </p>
        </div>
        <Link href="/admin/categories/new">
            <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Category
            </Button>
        </Link>
      </div>

       <Card>
          <CardContent className="p-0">
             <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="hidden w-[100px] sm:table-cell">Thumbnail</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Wallpaper Count</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="hidden sm:table-cell">
                      <OptimizedImage
                        alt={category.name}
                        className="aspect-video rounded-md object-cover"
                        height={45}
                        src={category.imageUrl}
                        width={80}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell>{category.wallpaperCount}</TableCell>
                    <TableCell>
                      <div className="flex justify-end">
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
                                    <Link href={`/admin/categories/${category.id}/edit`} className="cursor-pointer">
                                        <Pencil className="mr-2 h-4 w-4" /> Edit
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => openDeleteDialog(category)} className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    <span>Delete</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
    </div>

    <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the category &quot;{categoryToDelete?.name}&quot;.
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

function CategoriesPageSkeleton() {
    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-4 w-80" />
                </div>
                <Skeleton className="h-10 w-36" />
            </div>
             <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
            </div>
        </div>
    )
}
