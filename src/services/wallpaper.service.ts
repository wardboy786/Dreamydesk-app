
'use server';

import { Wallpaper } from "@/lib/types";
import { revalidatePath, unstable_cache as nextCache } from "next/cache";
import { db, storage, admin } from '@/lib/firebase-admin';
import { convertDocToWallpaper } from './service-helpers';
import { incrementCategoryWallpaperCount } from "./category.service";
import { logView, logLike } from "./analytics-service";

const FieldValue = admin.firestore.FieldValue;
const Timestamp = admin.firestore.Timestamp;
const ONE_YEAR_IN_SECONDS = 31536000;


/**
 * Securely downloads a wallpaper from Firebase Storage on the server and returns it as a Base64 string.
 * This function is not cached as it's a direct user action.
 */
export async function downloadWallpaper(wallpaperId: string): Promise<{ base64: string, contentType: string }> {
    try {
        const wallpaperDoc = await db.collection('wallpapers').doc(wallpaperId).get();
        if (!wallpaperDoc.exists) {
            throw new Error('Wallpaper not found.');
        }

        const wallpaperData = convertDocToWallpaper(wallpaperDoc);
        const bucket = storage.bucket();
        let filePath;

        // Priority 1: Use the reliable fileName if it exists.
        if (wallpaperData.fileName) {
            filePath = wallpaperData.fileName;
        } else {
            // Priority 2: Fallback to parsing the imageUrl. This now handles both direct
            // Firebase URLs and our Cloudflare CDN URLs.
            const decodedUrl = decodeURIComponent(wallpaperData.imageUrl);
            
            // Check if it's a CDN URL and extract the original Firebase URL from it
            if (decodedUrl.includes('/cdn-cgi/image/')) {
                 const urlParts = decodedUrl.split('firebasestorage.googleapis.com');
                 if (urlParts.length > 1) {
                    const firebaseUrl = 'https://firebasestorage.googleapis.com' + urlParts[1];
                    filePath = new URL(firebaseUrl).pathname.split('/o/')[1]?.split('?')[0];
                 }
            } else if (decodedUrl.includes('firebasestorage.googleapis.com')) {
                // It's a direct Firebase URL
                filePath = new URL(decodedUrl).pathname.split('/o/')[1]?.split('?')[0];
            }
        }

        if (!filePath) {
            console.error(`Could not determine file path for wallpaper ID: ${wallpaperId}. Image URL: ${wallpaperData.imageUrl}`);
            throw new Error('Could not determine file path from wallpaper data.');
        }
        
        const file = bucket.file(filePath);
        
        const [buffer] = await file.download();
        const [metadata] = await file.getMetadata();
        const contentType = metadata.contentType || 'application/octet-stream';

        return {
            base64: buffer.toString('base64'),
            contentType: contentType
        };

    } catch (error) {
        console.error('Server-side download failed:', error);
        if (error instanceof Error) {
            throw new Error(`Failed to download wallpaper from storage. Reason: ${error.message}`);
        }
        throw new Error('Failed to download wallpaper from storage.');
    }
}

// Cached function to get all wallpapers
export const getAllWallpapers = nextCache(
    async () => {
        const snapshot = await db.collection("wallpapers").orderBy("createdAt", "desc").get();
        return snapshot.docs.map(convertDocToWallpaper);
    },
    ['wallpapers'],
    { revalidate: ONE_YEAR_IN_SECONDS, tags: ['wallpapers-collection'] }
);


export async function getWallpaperById(id: string, incrementView = false): Promise<Wallpaper | null> {
    const getCachedWallpaper = nextCache(
        async (wallpaperId: string) => {
            const docRef = db.collection("wallpapers").doc(wallpaperId);
            const docSnap = await docRef.get();
            if (docSnap.exists) {
                return convertDocToWallpaper(docSnap);
            }
            return null;
        },
        ['wallpaper', id], // Use a more specific cache key array
        { revalidate: ONE_YEAR_IN_SECONDS, tags: [`wallpaper:${id}`] }
    );
    
    const wallpaperData = await getCachedWallpaper(id);
    
    // This must be outside the cache call
    if (incrementView && wallpaperData) {
        await updateWallpaperViews(id, 1);
        await logView(id); // Log the view event for historical analytics
    }
    
    if (wallpaperData) {
        if (wallpaperData.likes === undefined) wallpaperData.likes = 0;
        if (wallpaperData.downloads === undefined) wallpaperData.downloads = 0;
    }
    return wallpaperData;
}

export async function saveWallpaperMetadata(wallpaperData: Omit<Wallpaper, 'id' | 'createdAt' | 'updatedAt'>): Promise<Wallpaper> {
    const now = Timestamp.now();
    const docData = {
        ...wallpaperData,
        premium: wallpaperData.premium || false, // Ensure premium is always a boolean
        isExclusive: wallpaperData.isExclusive || false, // Ensure exclusive is always a boolean
        downloads: 0,
        likes: 0,
        shares: 0,
        views: 0,
        rating: 0,
        featured: false,
        createdAt: now,
        updatedAt: now,
    };

    const docRef = await db.collection("wallpapers").add(docData);

    if (wallpaperData.category) {
       await incrementCategoryWallpaperCount(wallpaperData.category, 1);
    }
    
    revalidatePath('/', 'layout'); // Revalidate all pages for new content
    return getWallpaperById(docRef.id, false) as Promise<Wallpaper>;
}

export async function updateWallpaper(id: string, originalCategory: string, wallpaperData: Partial<Omit<Wallpaper, 'id' | 'createdAt'>>): Promise<void> {
    const wallpaperRef = db.collection('wallpapers').doc(id);
    const batch = db.batch();

    const dataWithTimestamp = {
        ...wallpaperData,
        updatedAt: Timestamp.now(),
    };
    batch.update(wallpaperRef, dataWithTimestamp);

    if (wallpaperData.category && wallpaperData.category !== originalCategory) {
        await incrementCategoryWallpaperCount(originalCategory, -1, batch);
        await incrementCategoryWallpaperCount(wallpaperData.category, 1, batch);
    }
    
    await batch.commit();
    revalidatePath('/', 'layout');
}

export async function deleteWallpaper(id: string): Promise<void> {
    const wallpaperRef = db.collection('wallpapers').doc(id);
    const doc = await wallpaperRef.get();
    if (!doc.exists) {
        throw new Error("Wallpaper not found.");
    }
    
    const wallpaperData = convertDocToWallpaper(doc); 
    const batch = db.batch();

    batch.delete(wallpaperRef);

    if (wallpaperData.category) {
        await incrementCategoryWallpaperCount(wallpaperData.category, -1, batch);
    }

    try {
        let filePath;
        if (wallpaperData.fileName) {
            filePath = wallpaperData.fileName;
        } else {
            const decodedUrl = decodeURIComponent(wallpaperData.imageUrl);
            filePath = new URL(decodedUrl).pathname.split('/o/')[1]?.split('?')[0];
        }
        
        if (filePath) {
            const file = storage.bucket().file(filePath);
            await file.delete();
        } else {
             console.warn(`Cannot delete file from Storage for wallpaper ${id}: fileName is missing.`);
        }
    } catch (storageError) {
        console.error(`Failed to delete file from Storage for wallpaper ${id}. It might have already been deleted.`, storageError);
    }
    
    await batch.commit();
    revalidatePath('/', 'layout');
}

export const getLatestWallpapers = nextCache(
    async (count: number) => {
        const snapshot = await db.collection("wallpapers").orderBy("createdAt", "desc").limit(count).get();
        return snapshot.docs.map(convertDocToWallpaper);
    },
    ['latest-wallpapers'],
    { revalidate: 300, tags: ['wallpapers-collection'] } // Cache for 5 minutes
);

export const getPopularWallpapers = nextCache(
    async (count: number) => {
        const allWallpapers = await getAllWallpapers(); // Uses the cached version
        const scoredWallpapers = allWallpapers.map(wallpaper => {
            const downloads = wallpaper.downloads || 0;
            const likes = wallpaper.likes || 0;
            const views = wallpaper.views || 0;
            const score = (downloads * 5) + (likes * 3) + (views * 1);
            return { ...wallpaper, score };
        });
        return scoredWallpapers.sort((a, b) => b.score - a.score).slice(0, count);
    },
    ['popular-wallpapers'],
    { revalidate: 3600, tags: ['wallpapers-collection'] } // Cache for 1 hour
);


export const getPremiumWallpapers = nextCache(
    async () => {
        const snapshot = await db.collection("wallpapers").where("premium", "==", true).get();
        return snapshot.docs.map(convertDocToWallpaper).sort((a, b) => b.downloads - a.downloads);
    },
    ['premium-wallpapers'],
    { revalidate: 3600, tags: ['wallpapers-collection'] }
);

export const getFeaturedWallpapers = nextCache(
    async (count: number) => {
        const snapshot = await db.collection("wallpapers").where("featured", "==", true).orderBy("createdAt", "desc").limit(count).get();
        return snapshot.docs.map(convertDocToWallpaper);
    },
    ['featured-wallpapers'],
    { revalidate: 3600, tags: ['wallpapers-collection'] }
);

export async function setFeaturedWallpapers(wallpaperIds: string[]): Promise<void> {
    const batch = db.batch();
    
    const allWallpapersSnapshot = await db.collection("wallpapers").where("featured", "==", true).get();
    allWallpapersSnapshot.forEach(docSnap => {
        batch.update(docSnap.ref, { featured: false });
    });

    for (const id of wallpaperIds) {
        const docRef = db.collection("wallpapers").doc(id);
        batch.update(docRef, { featured: true });
    }
    
    await batch.commit();
    revalidatePath('/', 'layout');
}


// A simple Levenshtein distance function to check for similarity between two strings
function levenshtein(a: string, b: string): number {
  const an = a ? a.length : 0;
  const bn = b ? b.length : 0;
  if (an === 0) return bn;
  if (bn === 0) return an;
  const matrix = new Array<number[]>(bn + 1);
  for (let i = 0; i <= bn; ++i) {
    let row = matrix[i] = new Array<number>(an + 1);
    row[0] = i;
  }
  const firstRow = matrix[0];
  for (let j = 1; j <= an; ++j) {
    firstRow[j] = j;
  }
  for (let i = 1; i <= bn; ++i) {
    for (let j = 1; j <= an; ++j) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          Math.min(
            matrix[i][j - 1] + 1, // insertion
            matrix[i - 1][j] + 1 // deletion
          )
        );
      }
    }
  }
  return matrix[bn][an];
};

export async function searchWallpapers(query: string): Promise<{
  results: Wallpaper[];
  hasExactMatches: boolean;
}> {
  const lowerCaseQuery = query.toLowerCase().trim();
  if (!lowerCaseQuery) {
    return { results: [], hasExactMatches: false };
  }

  const queryTerms = lowerCaseQuery.split(/\s+/).filter(term => term.length > 0);
  const allWallpapers = await getAllWallpapers(); // Uses cached version
  let hasExactMatches = false;

  const scoredWallpapers = allWallpapers.map(wallpaper => {
    let score = 0;
    const title = wallpaper.title.toLowerCase();
    const description = wallpaper.description.toLowerCase();
    const tags = wallpaper.tags.map(t => t.toLowerCase());
    const category = wallpaper.category.toLowerCase();

    const titleWords = title.split(/\s+/);

    queryTerms.forEach(term => {
      if (tags.includes(term)) {
        score += 15;
        hasExactMatches = true;
      }
      if (category === term) {
        score += 10;
        hasExactMatches = true;
      }
      if (titleWords.includes(term)) {
        score += 10;
        hasExactMatches = true;
      }
      const maxDist = term.length > 5 ? 2 : 1; 
      tags.forEach(tag => {
          if(levenshtein(term, tag) <= maxDist) {
              score += 5;
              hasExactMatches = true;
          }
      });
       titleWords.forEach(titleWord => {
          if(levenshtein(term, titleWord) <= maxDist) {
              score += 5;
              hasExactMatches = true;
          }
       });
      if (description.includes(term)) {
        score += 1;
      }
    });
    
    return { wallpaper, score };
  });

  const matchedWallpapers = scoredWallpapers
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(item => item.wallpaper);

  if (matchedWallpapers.length > 0) {
    return { results: matchedWallpapers, hasExactMatches };
  }

  const relatedResults = allWallpapers.filter(wallpaper => {
    const wallpaperTags = wallpaper.tags.map(t => t.toLowerCase());
    return queryTerms.some(term => wallpaperTags.some(tag => tag.includes(term)));
  })
  .sort((a, b) => (b.downloads + b.views) - (a.downloads + a.views))
  .slice(0, 20);

  return { results: relatedResults, hasExactMatches: false };
}

export async function updateWallpaperLikes(wallpaperId: string, increment: boolean): Promise<void> {
    const docRef = db.collection("wallpapers").doc(wallpaperId);
    const userId = "server-action"; // Or get the actual user ID if available
    
    // Atomically update the like count on the wallpaper document
    await docRef.update({
        likes: FieldValue.increment(increment ? 1 : -1),
        updatedAt: Timestamp.now(),
    });

    // Log the like event for historical analytics
    if (increment) {
        await logLike(wallpaperId, userId);
    }
    
    revalidatePath(`/wallpaper/${wallpaperId}`);
    revalidatePath('/menu/profile');
    revalidatePath('/admin', 'layout');
}

export async function updateWallpaperViews(wallpaperId: string, increment: number): Promise<void> {
  const docRef = db.collection("wallpapers").doc(wallpaperId);
  await docRef.update({ 
      views: FieldValue.increment(increment),
      updatedAt: Timestamp.now(),
  });
}

export async function updateWallpaperDownloads(wallpaperId: string): Promise<void> {
    const docRef = db.collection("wallpapers").doc(wallpaperId);
    await docRef.update({
        downloads: FieldValue.increment(1),
        updatedAt: Timestamp.now(),
    });
    revalidatePath(`/wallpaper/${wallpaperId}`);
    revalidatePath('/menu/profile');
    revalidatePath('/admin', 'layout');
}

export const getWallpapersByIds = nextCache(
    async (wallpaperIds: string[]) => {
        if (!wallpaperIds || wallpaperIds.length === 0) return [];
        
        const idBatches: string[][] = [];
        for (let i = 0; i < wallpaperIds.length; i += 30) {
            idBatches.push(wallpaperIds.slice(i, i + 30));
        }

        const queryPromises = idBatches.map(batch => 
            db.collection("wallpapers").where(admin.firestore.FieldPath.documentId(), "in", batch).get()
        );
        const snapshots = await Promise.all(queryPromises);
        
        const wallpaperDocs = snapshots.flatMap(snapshot => snapshot.docs);
        const wallpapersMap = new Map(wallpaperDocs.map(docSnap => [docSnap.id, convertDocToWallpaper(docSnap)]));
        
        return wallpaperIds.map(id => wallpapersMap.get(id)).filter((w): w is Wallpaper => w !== undefined);
    },
    ['wallpapers-by-ids'],
    { revalidate: ONE_YEAR_IN_SECONDS }
);


export const getWallpapersByViews = nextCache(
    async (direction: 'asc' | 'desc' = 'desc', limitCount = 20) => {
        const snapshot = await db.collection("wallpapers").orderBy("views", direction).limit(limitCount).get();
        return snapshot.docs.map(convertDocToWallpaper);
    },
    ['wallpapers-by-views'],
    { revalidate: 3600, tags: ['wallpapers-collection'] }
);

export const getWallpapersByDownloads = nextCache(
    async (direction: 'asc' | 'desc' = 'desc', limitCount = 20) => {
        const snapshot = await db.collection("wallpapers").orderBy("downloads", direction).limit(limitCount).get();
        return snapshot.docs.map(convertDocToWallpaper);
    },
    ['wallpapers-by-downloads'],
    { revalidate: 3600, tags: ['wallpapers-collection'] }
);

export const getWallpapersByLikes = nextCache(
    async (direction: 'asc' | 'desc' = 'desc', limitCount = 20) => {
        const snapshot = await db.collection("wallpapers").orderBy("likes", direction).limit(limitCount).get();
        return snapshot.docs.map(convertDocToWallpaper);
    },
    ['wallpapers-by-likes'],
    { revalidate: 3600, tags: ['wallpapers-collection'] }
);

export const getWallpapersByCategory = nextCache(
    async (categoryName: string) => {
        const snapshot = await db.collection("wallpapers").where("category", "==", categoryName).get();
        const wallpapers = snapshot.docs.map(convertDocToWallpaper);

        const scoredWallpapers = wallpapers.map(wallpaper => {
            const downloads = wallpaper.downloads || 0;
            const likes = wallpaper.likes || 0;
            const views = wallpaper.views || 0;
            const score = (downloads * 5) + (likes * 3) + (views * 1);
            return { ...wallpaper, score };
        });

        return scoredWallpapers.sort((a, b) => b.score - a.score);
    },
    ['wallpapers-by-category'],
    { revalidate: 3600, tags: ['wallpapers-collection'] }
);

export async function getLatestWallpapersInRange(startDate: Date, endDate: Date, limit: number): Promise<Wallpaper[]> {
    const startOfDay = new Date(startDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(endDate);
    endOfDay.setHours(23, 59, 59, 999);
    
    const startTimestamp = Timestamp.fromDate(startOfDay);
    const endTimestamp = Timestamp.fromDate(endOfDay);

    const snapshot = await db.collection("wallpapers")
        .where('createdAt', '>=', startTimestamp)
        .where('createdAt', '<=', endTimestamp)
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .get();

    return snapshot.docs.map(convertDocToWallpaper);
}


/**
 * Gets related wallpapers for the infinite feed.
 * @param currentWallpaper The wallpaper to find related content for.
 * @param limit The number of related wallpapers to return.
 * @param excludeIds An array of wallpaper IDs to exclude from the results.
 * @returns A promise that resolves to an array of related or popular wallpapers.
 */
export async function getMoreRelatedWallpapers(currentWallpaper: Wallpaper, limit: number, excludeIds: string[] = []): Promise<Wallpaper[]> {
    const allWallpapers = await getAllWallpapers(); // This uses the cache

    const currentTags = new Set(currentWallpaper.tags.map(t => t.toLowerCase()));

    const scoredWallpapers = allWallpapers
        .filter(w => !excludeIds.includes(w.id)) // Exclude already seen wallpapers
        .map(w => {
            const relatedTags = w.tags.filter(tag => currentTags.has(tag.toLowerCase()));
            const popularityScore = (w.downloads || 0) * 5 + (w.likes || 0) * 3 + (w.views || 0);
            const categoryBonus = w.category === currentWallpaper.category ? 50 : 0;
            const score = (relatedTags.length * 20) + categoryBonus;
            
            return { wallpaper: w, score, popularityScore };
        })
        .filter(item => item.score > 0)
        .sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            return b.popularityScore - a.popularityScore;
        })
        .map(item => item.wallpaper);

    if (scoredWallpapers.length > 0) {
        return scoredWallpapers.slice(0, limit);
    }

    // Fallback: if no tag/category matches, get most popular unseen wallpapers
    const popularWallpapers = await getPopularWallpapers(limit + excludeIds.length);
    return popularWallpapers.filter(p => !excludeIds.includes(p.id)).slice(0, limit);
}
