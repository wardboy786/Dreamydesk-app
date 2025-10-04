
'use server';

import { db, admin } from '@/lib/firebase-admin';
import { CuratedCollection, Wallpaper } from '@/lib/types';
import { getWallpapersByIds } from './wallpaper.service';
import { headers } from 'next/headers';
import { format } from 'date-fns';

const Timestamp = admin.firestore.Timestamp;

export interface LocationData {
    country: string;
    city: string;
    lat: number;
    lon: number;
}

export interface WallpaperWithDownloadCount extends Wallpaper {
    downloadCount: number;
}

export interface SearchQuery {
    query: string;
    count: number;
}

export interface CollectionAnalyticsData extends CuratedCollection {
    views: number;
    totalDownloads: number;
    topWallpaper?: (Wallpaper & { collectionDownloads: number }) | null;
}


/**
 * Logs a click/view event for a collection.
 * @param collectionId The ID of the viewed collection.
 */
export async function logCollectionView(collectionId: string): Promise<void> {
    const headerList = headers();
    const userId = headerList.get('x-user-id') || 'guest';

    await db.collection('collection_views').add({
        collectionId,
        userId,
        timestamp: Timestamp.now(),
    });
}

/**
 * Logs a download event specific to a collection.
 * @param wallpaperId The ID of the downloaded wallpaper.
 * @param collectionId The ID of the collection it was downloaded from.
 * @param userId The ID of the user.
 */
export async function logCollectionDownload(wallpaperId: string, collectionId: string, userId: string): Promise<void> {
     await db.collection('collection_downloads').add({
        wallpaperId,
        collectionId,
        userId,
        timestamp: Timestamp.now(),
    });
}


/**
 * Retrieves analytics data for all curated collections.
 * @returns A promise that resolves to an array of collections with their analytics data.
 */
export async function getCollectionAnalytics(): Promise<CollectionAnalyticsData[]> {
    // 1. Fetch all collections
    const collectionsSnapshot = await db.collection('collections').get();
    const allCollections = collectionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CuratedCollection));

    // 2. Fetch all collection views
    const viewsSnapshot = await db.collection('collection_views').get();
    const viewCounts = new Map<string, number>();
    viewsSnapshot.forEach(doc => {
        const { collectionId } = doc.data();
        viewCounts.set(collectionId, (viewCounts.get(collectionId) || 0) + 1);
    });
    
    // 3. Fetch all collection-specific downloads
    const downloadsSnapshot = await db.collection('collection_downloads').get();
    const collectionDownloads = new Map<string, { wallpaperId: string }[]>();
    downloadsSnapshot.forEach(doc => {
        const { collectionId, wallpaperId } = doc.data();
        if (!collectionDownloads.has(collectionId)) {
            collectionDownloads.set(collectionId, []);
        }
        collectionDownloads.get(collectionId)!.push({ wallpaperId });
    });


    // 4. Process each collection to gather its analytics
    const analyticsDataPromises = allCollections.map(async (collection) => {
        let totalDownloads = 0;
        let topWallpaper: (Wallpaper & { collectionDownloads: number }) | null = null;

        const downloads = collectionDownloads.get(collection.id) || [];
        totalDownloads = downloads.length;

        if (downloads.length > 0) {
            const wallpaperDownloadCounts = new Map<string, number>();
            downloads.forEach(d => {
                wallpaperDownloadCounts.set(d.wallpaperId, (wallpaperDownloadCounts.get(d.wallpaperId) || 0) + 1);
            });
            
            const topWallpaperEntry = [...wallpaperDownloadCounts.entries()].sort((a,b) => b[1] - a[1])[0];
            const topWallpaperId = topWallpaperEntry[0];
            const topWallpaperDownloads = topWallpaperEntry[1];

            const wallpaperDataArray = await getWallpapersByIds([topWallpaperId]);
            if(wallpaperDataArray.length > 0) {
                const wallpaperData = wallpaperDataArray[0];
                if (wallpaperData) {
                    topWallpaper = {
                        ...wallpaperData,
                        collectionDownloads: topWallpaperDownloads
                    };
                }
            }
        }
        
        return {
            ...collection,
            views: viewCounts.get(collection.id) || 0,
            totalDownloads,
            topWallpaper,
        };
    });

    const analyticsData = await Promise.all(analyticsDataPromises);
    
    // Sort collections by views
    return analyticsData.sort((a,b) => b.views - a.views);
}


/**
 * Logs a download event in the `downloads` collection.
 * @param wallpaperId The ID of the downloaded wallpaper.
 * @param userId The ID of the user who downloaded the wallpaper, or 'guest'.
 */
export async function logDownload(wallpaperId: string, userId: string): Promise<void> {
    const headerList = headers();
    // More robust IP detection for various hosting environments
    const ip = (
        headerList.get('x-real-ip') ||
        headerList.get('x-forwarded-for')?.split(',')[0] ||
        '127.0.0.1'
    ).trim();

    let locationData: LocationData | null = null;
    if (ip && ip !== '127.0.0.1' && !ip.startsWith('10.') && !ip.startsWith('192.168.')) {
        try {
            const geoResponse = await fetch(`https://ipapi.co/${ip}/json/`);
            if (geoResponse.ok) {
                 try {
                    const data = await geoResponse.json();
                    if (!data.error) {
                        locationData = {
                            country: data.country_name || 'Unknown',
                            city: data.city || 'Unknown',
                            lat: data.latitude,
                            lon: data.longitude
                        };
                    } else {
                        console.warn(`Geolocation lookup for IP ${ip} returned an error: ${data.reason}`);
                    }
                 } catch (jsonError) {
                    console.error("Failed to parse JSON from geolocation API for IP:", ip, jsonError);
                 }
            } else {
                console.warn(`Geolocation API request failed for IP ${ip} with status: ${geoResponse.status}`);
            }
        } catch (error) {
            console.error("Geolocation fetch failed for IP:", ip, error);
        }
    }

    const downloadLog: {
        wallpaperId: string;
        userId: string;
        timestamp: FirebaseFirestore.Timestamp;
        location?: LocationData;
    } = {
        wallpaperId,
        userId,
        timestamp: Timestamp.now(),
    };

    if (locationData) {
        downloadLog.location = locationData;
    }

    await db.collection('downloads').add(downloadLog);
}

/**
 * Logs a view event in the `views` collection.
 * @param wallpaperId The ID of the viewed wallpaper.
 */
export async function logView(wallpaperId: string): Promise<void> {
    await db.collection('views').add({
        wallpaperId,
        timestamp: Timestamp.now(),
    });
}


/**
 * Logs a like event in the `likes` collection.
 * @param wallpaperId The ID of the liked wallpaper.
 * @param userId The ID of the user.
 */
export async function logLike(wallpaperId: string, userId: string): Promise<void> {
    await db.collection('likes').add({
        wallpaperId,
        userId,
        timestamp: Timestamp.now(),
    });
}

/**
 * Retrieves and aggregates download counts for wallpapers within a specific date range.
 * @param startDate The start of the date range.
 * @param endDate The end of the date range.
 * @returns A promise that resolves to an object containing the results and total downloads count.
 */
export async function getDownloadsByDateRange(startDate: Date, endDate: Date): Promise<{ results: WallpaperWithDownloadCount[], totalDownloads: number }> {
    const startOfDay = new Date(startDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(endDate);
    endOfDay.setHours(23, 59, 59, 999);

    const startTimestamp = Timestamp.fromDate(startOfDay);
    const endTimestamp = Timestamp.fromDate(endOfDay);
    
    const downloadsSnapshot = await db.collection('downloads')
        .where('timestamp', '>=', startTimestamp)
        .where('timestamp', '<=', endTimestamp)
        .get();

    if (downloadsSnapshot.empty) {
        return { results: [], totalDownloads: 0 };
    }

    const downloadCounts = new Map<string, number>();
    downloadsSnapshot.forEach(doc => {
        const { wallpaperId } = doc.data();
        downloadCounts.set(wallpaperId, (downloadCounts.get(wallpaperId) || 0) + 1);
    });

    const totalDownloads = downloadsSnapshot.size;
    const sortedWallpaperIds = [...downloadCounts.entries()]
        .sort((a, b) => b[1] - a[1])
        .map(entry => entry[0]);

    const wallpapersData = await getWallpapersByIds(sortedWallpaperIds);

    const results = wallpapersData.map(wallpaper => ({
        ...wallpaper,
        downloadCount: downloadCounts.get(wallpaper.id) || 0
    }));

    return { results, totalDownloads };
}



/**
 * Retrieves and aggregates download counts per day for a given date range.
 * @param startDate The start date of the trend data.
 * @param endDate The end date of the trend data.
 * @returns A promise that resolves to an array of objects with date and count.
 */
export async function getDownloadTrendData(startDate: Date, endDate: Date): Promise<{ date: string; count: number }[]> {
    const startOfDay = new Date(startDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(endDate);
    endOfDay.setHours(23, 59, 59, 999);

    const startTimestamp = Timestamp.fromDate(startOfDay);
    const endTimestamp = Timestamp.fromDate(endOfDay);

    const snapshot = await db.collection('downloads')
        .where('timestamp', '>=', startTimestamp)
        .where('timestamp', '<=', endTimestamp)
        .orderBy('timestamp', 'asc')
        .get();

    const dailyCounts = new Map<string, number>();
    snapshot.forEach(doc => {
        const date = format(doc.data().timestamp.toDate(), 'yyyy-MM-dd');
        dailyCounts.set(date, (dailyCounts.get(date) || 0) + 1);
    });

    return Array.from(dailyCounts, ([date, count]) => ({ date, count }));
}

/**
 * Retrieves and aggregates view counts per day for a given date range.
 * @param startDate The start date of the trend data.
 * @param endDate The end date of the trend data.
 * @returns A promise that resolves to an array of objects with date and count.
 */
export async function getViewTrendData(startDate: Date, endDate: Date): Promise<{ date: string; count: number }[]> {
    const startOfDay = new Date(startDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(endDate);
    endOfDay.setHours(23, 59, 59, 999);

    const startTimestamp = Timestamp.fromDate(startOfDay);
    const endTimestamp = Timestamp.fromDate(endOfDay);

    const snapshot = await db.collection('views')
        .where('timestamp', '>=', startTimestamp)
        .where('timestamp', '<=', endTimestamp)
        .orderBy('timestamp', 'asc')
        .get();

    const dailyCounts = new Map<string, number>();
    snapshot.forEach(doc => {
        const date = format(doc.data().timestamp.toDate(), 'yyyy-MM-dd');
        dailyCounts.set(date, (dailyCounts.get(date) || 0) + 1);
    });

    return Array.from(dailyCounts, ([date, count]) => ({ date, count }));
}


/**
 * Logs a user's search query to the `search_logs` collection.
 * @param query The search term entered by the user.
 */
export async function logSearchQuery(query: string): Promise<void> {
  const normalizedQuery = query.toLowerCase().trim();
  if (!normalizedQuery) return;

  await db.collection('search_logs').add({
    query: normalizedQuery,
    timestamp: Timestamp.now(),
  });
}

/**
 * Retrieves and ranks the most popular search queries.
 * @param limit The number of top search queries to return.
 * @returns A promise that resolves to an array of top search queries with their counts.
 */
export async function getTopSearchQueries(limit: number): Promise<SearchQuery[]> {
  const snapshot = await db.collection('search_logs').get();

  if (snapshot.empty) {
    return [];
  }

  const queryCounts = new Map<string, number>();

  snapshot.docs.forEach(doc => {
    const data = doc.data();
    const query = data.query as string;
    if (query) {
      queryCounts.set(query, (queryCounts.get(query) || 0) + 1);
    }
  });

  const sortedQueries = Array.from(queryCounts.entries())
    .map(([query, count]) => ({ query, count }))
    .sort((a, b) => b.count - a.count);

  return sortedQueries.slice(0, limit);
}


/**
 * Gets total view count within a date range by querying the 'views' collection.
 * @param startDate The start date.
 * @param endDate The end date.
 * @returns The total number of views in the range.
 */
export async function getViewsByDateRange(startDate: Date, endDate: Date): Promise<number> {
    const startOfDay = new Date(startDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(endDate);
    endOfDay.setHours(23, 59, 59, 999);

    const startTimestamp = Timestamp.fromDate(startOfDay);
    const endTimestamp = Timestamp.fromDate(endOfDay);

    const snapshot = await db.collection('views')
        .where('timestamp', '>=', startTimestamp)
        .where('timestamp', '<=', endTimestamp)
        .count()
        .get();

    return snapshot.data().count;
}

/**
 * Gets total like count within a date range by querying the 'likes' collection.
 * @param startDate The start date.
 * @param endDate The end date.
 * @returns The total number of likes in the range.
 */
export async function getLikesByDateRange(startDate: Date, endDate: Date): Promise<number> {
    const startOfDay = new Date(startDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(endDate);
    endOfDay.setHours(23, 59, 59, 999);

    const startTimestamp = Timestamp.fromDate(startOfDay);
    const endTimestamp = Timestamp.fromDate(endOfDay);

    const snapshot = await db.collection('likes')
        .where('timestamp', '>=', startTimestamp)
        .where('timestamp', '<=', endTimestamp)
        .count()
        .get();
        
    return snapshot.data().count;
}


/**
 * Gets the most popular wallpapers in a given date range.
 * Popularity is determined by a weighted score of downloads, likes, and views.
 * The returned wallpaper objects are augmented with their specific counts within the date range.
 * @param startDate The start date of the range.
 * @param endDate The end date of the range.
 * @param limit The number of wallpapers to return.
 * @returns A promise resolving to an array of the most popular wallpapers with date-ranged stats.
 */
export async function getPopularWallpapersInRange(
    startDate: Date,
    endDate: Date,
    limit: number
): Promise<(Wallpaper & { views: number; downloads: number; likes: number })[]> {
    const startOfDay = new Date(startDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(endDate);
    endOfDay.setHours(23, 59, 59, 999);
    
    const startTimestamp = Timestamp.fromDate(startOfDay);
    const endTimestamp = Timestamp.fromDate(endOfDay);

    const downloadsSnapshot = await db.collection('downloads').where('timestamp', '>=', startTimestamp).where('timestamp', '<=', endTimestamp).get();
    const likesSnapshot = await db.collection('likes').where('timestamp', '>=', startTimestamp).where('timestamp', '<=', endTimestamp).get();
    const viewsSnapshot = await db.collection('views').where('timestamp', '>=', startTimestamp).where('timestamp', '<=', endTimestamp).get();

    const scores = new Map<string, number>();
    const viewsInRange = new Map<string, number>();
    const downloadsInRange = new Map<string, number>();
    const likesInRange = new Map<string, number>();

    downloadsSnapshot.forEach(doc => {
        const id = doc.data().wallpaperId;
        scores.set(id, (scores.get(id) || 0) + 5);
        downloadsInRange.set(id, (downloadsInRange.get(id) || 0) + 1);
    });
    likesSnapshot.forEach(doc => {
        const id = doc.data().wallpaperId;
        scores.set(id, (scores.get(id) || 0) + 3);
        likesInRange.set(id, (likesInRange.get(id) || 0) + 1);
    });
    viewsSnapshot.forEach(doc => {
        const id = doc.data().wallpaperId;
        scores.set(id, (scores.get(id) || 0) + 1);
        viewsInRange.set(id, (viewsInRange.get(id) || 0) + 1);
    });

    const sortedWallpaperIds = Array.from(scores.entries())
        .sort((a, b) => b[1] - a[1])
        .map(entry => entry[0])
        .slice(0, limit);
        
    if (sortedWallpaperIds.length === 0) return [];

    const wallpapers = await getWallpapersByIds(sortedWallpaperIds);

    // Augment wallpaper data with the counts from the specified date range
    return wallpapers.map(wallpaper => ({
        ...wallpaper,
        views: viewsInRange.get(wallpaper.id) || 0,
        downloads: downloadsInRange.get(wallpaper.id) || 0,
        likes: likesInRange.get(wallpaper.id) || 0,
    })).sort((a, b) => (scores.get(b.id) || 0) - (scores.get(a.id) || 0)); // Re-sort based on score
}

/**
 * Gets the total count of all wallpapers in the database.
 * @returns A promise resolving to the total number of wallpapers.
 */
export async function getTotalWallpaperCount(): Promise<number> {
    const snapshot = await db.collection('wallpapers').count().get();
    return snapshot.data().count;
}
