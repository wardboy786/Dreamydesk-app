
'use server';

import { db, admin } from '@/lib/firebase-admin'; // Use Admin SDK for server-side operations
import { getWallpapersByIds } from './wallpaper.service';
import { Wallpaper } from '@/lib/types';
import { revalidatePath, unstable_cache as nextCache } from 'next/cache';
import { logDownload } from './analytics-service';

const ONE_DAY_IN_SECONDS = 86400;

// --- Functions for Likes ---

export async function isWallpaperLiked(userId: string, wallpaperId: string): Promise<boolean> {
    if (userId.startsWith('guest_')) {
        // This is a client-side only check now. The actual localStorage access is done in the component.
        // This function is now just for type consistency on the server when called from a client component.
        // It will always return false on the server for a guest.
        return false;
    }
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) return false;
    const likedWallpapers = userDoc.data()?.likedWallpapers || [];
    return likedWallpapers.includes(wallpaperId);
}

export async function toggleWallpaperLike(userId: string, wallpaperId: string, shouldLike: boolean): Promise<void> {
    if (userId.startsWith('guest_')) {
        // Guest likes are handled entirely on the client via localStorage.
        // This server function will no longer be called for guests.
        return;
    }

    const userDocRef = db.collection('users').doc(userId);
    const FieldValue = admin.firestore.FieldValue;
    
    // Use set with merge true to create the doc if it doesn't exist
    await userDocRef.set({
        likedWallpapers: shouldLike ? FieldValue.arrayUnion(wallpaperId) : FieldValue.arrayRemove(wallpaperId)
    }, { merge: true });

    revalidatePath('/menu/profile');
    revalidatePath(`/wallpaper/${wallpaperId}`);
}


export async function getLikedWallpapers(userId: string): Promise<Wallpaper[]> {
    if (userId.startsWith('guest_')) {
        // This function will be called with an array of IDs from the client's localStorage,
        // so we don't implement the server-side guest logic here anymore.
        // The client component will handle this.
         return [];
    }

    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) return [];
    
    const likedIds = userDoc.data()?.likedWallpapers || [];
    if (likedIds.length === 0) return [];

    return getWallpapersByIds(likedIds);
}

// --- Functions for Downloads ---

export async function addDownloadedWallpaper(userId: string, wallpaperId: string): Promise<void> {
    // We log downloads for guests but don't persist their download history
    if (!userId.startsWith('guest_')) {
        const userDocRef = db.collection('users').doc(userId);
        const FieldValue = admin.firestore.FieldValue;

        await userDocRef.set({
            downloadedWallpapers: FieldValue.arrayUnion(wallpaperId)
        }, { merge: true });
         revalidatePath('/menu/profile/downloads');
    }

    // Log the download event for analytics for ALL users, including guests.
    await logDownload(wallpaperId, userId);
    revalidatePath('/admin/analytics/downloads', 'page');
}

export async function getDownloadedWallpapers(userId: string): Promise<Wallpaper[]> {
    if (userId.startsWith('guest_')) return [];

    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) return [];

    const downloadedIds = userDoc.data()?.downloadedWallpapers || [];
    if (downloadedIds.length === 0) return [];

    return getWallpapersByIds(downloadedIds);
}

// --- Functions for Subscribers ---

export interface Subscriber {
    id: string; // This will be the deviceId from the subscriptions collection
    displayName: string;
    email: string | null;
    photoURL?: string;
    type: 'user' | 'guest';
}

/**
 * Retrieves all subscribers from the unified 'subscriptions' collection.
 * This is now the single source of truth for all subscribers.
 * This function is NOT CACHED to ensure the admin panel always has the latest data.
 */
export async function getNotificationSubscribers(): Promise<Subscriber[]> {
    const snapshot = await db.collection('subscriptions').get();
    
    if (snapshot.empty) {
        return [];
    }

    const subscribers: Subscriber[] = [];

    snapshot.forEach(doc => {
        const data = doc.data();
        // We only care about subscriptions that have a valid token
        if (data.fcmToken) {
            subscribers.push({
                id: doc.id, // The document ID is the stable device ID
                displayName: data.userDisplayName || 'Guest User',
                email: data.userEmail || null,
                photoURL: data.userPhotoURL,
                type: data.userId ? 'user' : 'guest',
            });
        }
    });
    
    // Sort to show registered users first, then by name.
    return subscribers.sort((a, b) => {
        if (a.type === 'user' && b.type === 'guest') return -1;
        if (a.type === 'guest' && b.type === 'user') return 1;
        return a.displayName.localeCompare(b.displayName);
    });
}
