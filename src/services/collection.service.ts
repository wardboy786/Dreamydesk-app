
'use server';

import { CuratedCollection } from "@/lib/types";
import { revalidatePath, unstable_cache as nextCache } from "next/cache";
import { db, admin } from '@/lib/firebase-admin';
import { convertDocToCollection } from './service-helpers';

const ONE_YEAR_IN_SECONDS = 31536000;

export const getAllCollections = nextCache(
    async (limit?: number): Promise<CuratedCollection[]> => {
        let query: FirebaseFirestore.Query<FirebaseFirestore.DocumentData> = db.collection("collections");
        
        const snapshot = await query.get();
        
        const collections = snapshot.docs
          .sort((a, b) => {
              const dateA = a.createTime;
              const dateB = b.createTime;
              return dateB.toMillis() - dateA.toMillis();
          })
          .map(convertDocToCollection);

        if (limit) {
            return collections.slice(0, limit);
        }
        
        return collections;
    },
    ['collections'],
    { revalidate: ONE_YEAR_IN_SECONDS, tags: ['collections-collection'] }
);

export const getCollectionById = nextCache(
    async (id: string): Promise<CuratedCollection | null> => {
        const docRef = db.collection("collections").doc(id);
        const docSnap = await docRef.get();
        if (docSnap.exists) {
            return convertDocToCollection(docSnap);
        }
        return null;
    },
    ['collection-by-id'],
    { revalidate: ONE_YEAR_IN_SECONDS }
);

export async function createCollection(collectionData: Omit<CuratedCollection, 'id'>): Promise<CuratedCollection> {
    const docRef = await db.collection("collections").add(collectionData);
    revalidatePath('/', 'layout');
    const newDoc = await docRef.get();
    return convertDocToCollection(newDoc);
}

export async function updateCollection(id: string, collectionData: Partial<Omit<CuratedCollection, 'id'>>): Promise<void> {
    const docRef = db.collection("collections").doc(id);
    await docRef.update(collectionData);
    revalidatePath('/', 'layout');
}

export async function deleteCollection(id: string): Promise<void> {
    const docRef = db.collection("collections").doc(id);
    await docRef.delete();
    revalidatePath('/', 'layout');
}
