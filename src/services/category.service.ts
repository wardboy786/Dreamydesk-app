
'use server';

import { revalidatePath, unstable_cache as nextCache } from "next/cache";
import { db } from '@/lib/firebase-admin';
import { admin } from '@/lib/firebase-admin';
import { Category } from "@/lib/types";
import { convertDocToCategory } from "./service-helpers";
import { getWallpapersByCategory as getWallpapersByCategoryFromWallpaperService } from './wallpaper.service';

const FieldValue = admin.firestore.FieldValue;
const ONE_YEAR_IN_SECONDS = 31536000;

export const getAllCategories = nextCache(
    async (): Promise<Category[]> => {
        const snapshot = await db.collection("categories").orderBy("name").get();
        return snapshot.docs.map(convertDocToCategory);
    },
    ['categories'],
    { revalidate: ONE_YEAR_IN_SECONDS, tags: ['categories-collection'] }
);

export const getCategoryById = nextCache(
    async (id: string): Promise<Category | null> => {
        const docRef = db.collection("categories").doc(id);
        const docSnap = await docRef.get();
        if (docSnap.exists) {
            return convertDocToCategory(docSnap);
        }
        return null;
    },
    ['category-by-id'],
    { revalidate: ONE_YEAR_IN_SECONDS }
);


export async function getWallpapersByCategory(categoryName: string) {
    return getWallpapersByCategoryFromWallpaperService(categoryName);
}


export async function createCategory(name: string, imageUrl: string): Promise<Category> {
    const id = name.trim().toLowerCase().replace(/\s+/g, '-');
    const docRef = db.collection("categories").doc(id);

    const docSnap = await docRef.get();
    if (docSnap.exists) {
        throw new Error(`Category "${name}" already exists.`);
    }

    const newCategoryData: Omit<Category, 'id'> = {
        name: name.trim(),
        imageUrl: imageUrl,
        wallpaperCount: 0,
    };
    
    await docRef.set(newCategoryData);
    
    revalidatePath('/admin/categories');
    revalidatePath('/admin/upload');

    const newDoc = await docRef.get();
    return convertDocToCategory(newDoc);
}


export async function updateCategory(id: string, name: string, imageUrl?: string): Promise<void> {
    const docRef = db.collection("categories").doc(id);
    
    const originalCategoryDoc = await docRef.get();
    if (!originalCategoryDoc.exists) {
        throw new Error("Category to update not found.");
    }
    const originalCategory = convertDocToCategory(originalCategoryDoc);
    
    const dataToUpdate: { name: string, imageUrl?: string } = { name };
    if (imageUrl) {
        dataToUpdate.imageUrl = imageUrl;
    }

    const batch = db.batch();
    batch.update(docRef, dataToUpdate);

    if (originalCategory && originalCategory.name !== name) {
        const wallpapersRef = db.collection('wallpapers');
        const snapshot = await wallpapersRef.where('category', '==', originalCategory.name).get();
        snapshot.forEach(doc => {
            batch.update(doc.ref, { category: name });
        });
    }

    await batch.commit();

    revalidatePath('/admin/categories');
    revalidatePath(`/category/${id}`);
}


export async function deleteCategory(id: string): Promise<void> {
    const category = await getCategoryById(id);
    if (!category) {
        throw new Error("Category not found.");
    }
    if (category.wallpaperCount > 0) {
        throw new Error("Cannot delete a category that has wallpapers associated with it.");
    }

    await db.collection("categories").doc(id).delete();
    revalidatePath('/admin/categories');
}

export async function incrementCategoryWallpaperCount(categoryName: string, incrementValue: number, batch?: FirebaseFirestore.WriteBatch): Promise<void> {
    try {
        const categoriesRef = db.collection("categories");
        const categoryQuery = await categoriesRef.where('name', '==', categoryName).limit(1).get();
        
        if (!categoryQuery.empty) {
            const categoryDoc = categoryQuery.docs[0];
            const updateOp = { wallpaperCount: FieldValue.increment(incrementValue) };
            
            if (batch) {
                batch.update(categoryDoc.ref, updateOp);
            } else {
                await categoryDoc.ref.update(updateOp);
            }
        }
    } catch (catError) {
        console.warn(`Could not increment category count for "${categoryName}". It might not exist.`, catError);
    }
}
