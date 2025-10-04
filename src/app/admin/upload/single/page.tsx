
"use client";

import { Category } from "@/lib/types";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { UploadForm } from "@/components/admin/upload-form";
import { getAllCategories } from "@/services/category.service";
import { UploadCloud } from "lucide-react";

export default function SingleUploadPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCats = async () => {
      setLoading(true);
      const allCategories = await getAllCategories();
      setCategories(allCategories);
      setLoading(false);
    }
    fetchCats();
  }, []);

  if (loading) {
    return (
        <div className="space-y-8 animate-pulse">
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-4 w-80" />
                </div>
            </div>
             <div className="grid md:grid-cols-2 gap-8">
              <Skeleton className="h-[500px] w-full" />
              <Skeleton className="h-[500px] w-full" />
            </div>
        </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline flex items-center gap-2">
            <UploadCloud className="w-8 h-8 text-primary" />
            Single Wallpaper Upload
          </h1>
          <p className="text-muted-foreground">
            Upload, generate metadata, and publish a single wallpaper immediately.
          </p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto">
        <UploadForm existingCategories={categories} />
      </div>
    </div>
  );
}
