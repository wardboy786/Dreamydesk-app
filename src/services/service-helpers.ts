
import { Wallpaper, CuratedCollection, Category } from "@/lib/types";
import { db, storage, admin } from '@/lib/firebase-admin';

// --- Data Conversion Helpers ---

export const convertDocToWallpaper = (doc: FirebaseFirestore.DocumentSnapshot): Wallpaper => {
    const data = doc.data() as Omit<Wallpaper, 'id' | 'createdAt' | 'updatedAt'> & { createdAt?: FirebaseFirestore.Timestamp, updatedAt?: FirebaseFirestore.Timestamp };
    return {
        id: doc.id,
        title: data.title || '',
        description: data.description || '',
        imageUrl: data.imageUrl || '',
        fileName: data.fileName || '',
        thumbnailUrl: data.thumbnailUrl || data.imageUrl || '',
        resolution: data.resolution || 'N/A',
        aiHint: data.aiHint || '',
        category: data.category || 'Uncategorized',
        tags: data.tags || [],
        downloads: data.downloads || 0,
        likes: data.likes || 0,
        shares: data.shares || 0,
        views: data.views || 0,
        rating: data.rating || 0,
        featured: data.featured || false,
        premium: data.premium || false,
        isExclusive: data.isExclusive || false,
        createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
        updatedAt: data.updatedAt ? data.updatedAt.toDate() : (data.createdAt ? data.createdAt.toDate() : new Date()),
    };
}

export const convertDocToCollection = (doc: FirebaseFirestore.DocumentSnapshot): CuratedCollection => {
    const data = doc.data() as Omit<CuratedCollection, 'id'>;
    return { 
        id: doc.id, 
        title: data.title || '',
        description: data.description || '',
        thumbnailUrl: data.thumbnailUrl || '',
        wallpaperCount: data.wallpaperCount || 0,
        wallpaperIds: data.wallpaperIds || [],
        isPremium: data.isPremium || false,
    };
}

export const convertDocToCategory = (doc: FirebaseFirestore.DocumentSnapshot): Category => {
    const data = doc.data() as Omit<Category, 'id'>;
    return { 
        id: doc.id, 
        name: data.name || 'Unnamed',
        wallpaperCount: data.wallpaperCount || 0,
        imageUrl: data.imageUrl || '',
    };
}
