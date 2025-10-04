
"use client";

import { useState, useEffect } from "react";
import { getAllCategories } from "@/services/category.service";
import { Category } from "@/lib/types";
import Link from "next/link";
import OptimizedImage from "@/components/optimized-image";
import { Card } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { CategoryGridSkeleton } from "../skeletons/category-grid-skeleton";
import { useAuth } from "@/hooks/use-auth";

export default function CategoryGrid() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getAllCategories()
            .then(setCategories)
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return <CategoryGridSkeleton />;
    }
    
    if (!categories || categories.length === 0) {
      return <p className="text-center text-muted-foreground">No categories found.</p>;
    }

    return (
        <section>
            <div className="text-center mb-8">
                <h2 className="font-headline text-3xl font-bold">All Categories</h2>
                <p className="text-muted-foreground">Browse wallpapers by category.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {categories.map((category) => (
                    <Link href={`/category/${category.id}`} key={category.id}>
                        <Card className="overflow-hidden group transition-all duration-300 hover:shadow-xl hover:-translate-y-1 relative">
                            <AspectRatio ratio={4 / 3}>
                                <OptimizedImage 
                                    src={category.imageUrl} 
                                    alt={category.name} 
                                    fill 
                                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                                    className="object-cover transition-transform duration-300 group-hover:scale-105" 
                                    data-ai-hint={`${category.name.toLowerCase()}`} 
                                />
                                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors duration-300 flex items-center justify-center">
                                    <h3 className="text-white font-bold text-xl drop-shadow-lg">{category.name}</h3>
                                </div>
                            </AspectRatio>
                        </Card>
                    </Link>
                ))}
            </div>
        </section>
    );
}
