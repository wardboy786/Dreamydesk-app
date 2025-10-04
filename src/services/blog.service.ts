
'use server';

import { BlogPost } from "@/lib/types";
import { revalidatePath, unstable_cache as nextCache } from "next/cache";
import { db, admin } from '@/lib/firebase-admin';

const ONE_DAY_IN_SECONDS = 86400;

// Helper to convert Firestore doc to BlogPost type
const convertDocToBlogPost = (doc: FirebaseFirestore.DocumentSnapshot): BlogPost => {
    const data = doc.data();
    return {
        id: doc.id,
        slug: data?.slug || '',
        title: data?.title || '',
        content: data?.content || '',
        excerpt: data?.excerpt || '',
        thumbnailUrl: data?.thumbnailUrl || '',
        wallpaperIds: data?.wallpaperIds || [],
        status: data?.status || 'draft',
        createdAt: data?.createdAt?.toDate() || new Date(),
        updatedAt: data?.updatedAt?.toDate() || new Date(),
    } as BlogPost;
};


export const getAllBlogPosts = nextCache(
    async (): Promise<BlogPost[]> => {
        const snapshot = await db.collection("blog_posts").orderBy("createdAt", "desc").get();
        return snapshot.docs.map(convertDocToBlogPost);
    },
    ['all-blog-posts'],
    { revalidate: ONE_DAY_IN_SECONDS, tags: ['blog-collection'] }
);

export const getPublishedBlogPosts = nextCache(
    async (): Promise<BlogPost[]> => {
        const snapshot = await db.collection("blog_posts")
            .where('status', '==', 'published')
            .orderBy("createdAt", "desc")
            .get();
        return snapshot.docs.map(convertDocToBlogPost);
    },
    ['published-blog-posts'],
    { revalidate: ONE_DAY_IN_SECONDS, tags: ['blog-collection'] }
);

export const getBlogPostBySlug = nextCache(
    async (slug: string): Promise<BlogPost | null> => {
        if (!slug) return null;
        const snapshot = await db.collection("blog_posts").where("slug", "==", slug).limit(1).get();
        if (snapshot.empty) {
            return null;
        }
        return convertDocToBlogPost(snapshot.docs[0]);
    },
    ['blog-post-by-slug'],
    { revalidate: ONE_DAY_IN_SECONDS }
);

export const getBlogPostById = nextCache(
    async (id: string): Promise<BlogPost | null> => {
        const docRef = db.collection("blog_posts").doc(id);
        const docSnap = await docRef.get();
        if (docSnap.exists) {
            return convertDocToBlogPost(docSnap);
        }
        return null;
    },
    ['blog-post-by-id'],
    { revalidate: ONE_DAY_IN_SECONDS, tags: [`blog-post:${id}`] }
);


export async function createBlogPost(postData: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'>): Promise<BlogPost> {
    const now = admin.firestore.Timestamp.now();
    const docRef = await db.collection("blog_posts").add({
        ...postData,
        createdAt: now,
        updatedAt: now,
    });
    
    revalidatePath('/blog', 'layout');
    revalidatePath('/admin/blog', 'page');
    revalidatePath(`/sitemap.xml`);
    const newDoc = await docRef.get();
    return convertDocToBlogPost(newDoc);
}


export async function updateBlogPost(id: string, postData: Partial<Omit<BlogPost, 'id' | 'createdAt'>>): Promise<void> {
    const docRef = db.collection("blog_posts").doc(id);
    await docRef.update({
        ...postData,
        updatedAt: admin.firestore.Timestamp.now(),
    });
    
    // Revalidate paths
    revalidatePath(`/blog/${postData.slug}`, 'page');
    revalidatePath('/blog', 'layout');
    revalidatePath('/admin/blog', 'page');
    revalidatePath(`/sitemap.xml`);
    revalidatePath(`/admin/blog/${id}/edit`, 'page');
}


export async function deleteBlogPost(id: string): Promise<void> {
    const docRef = db.collection("blog_posts").doc(id);
    await docRef.delete();
    revalidatePath('/blog', 'layout');
    revalidatePath('/admin/blog', 'page');
    revalidatePath(`/sitemap.xml`);
}
