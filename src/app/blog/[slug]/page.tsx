
import { getBlogPostBySlug } from '@/services/blog.service';
import { getWallpapersByIds } from '@/services/wallpaper.service';
import type { Metadata, ResolvingMetadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BlogPostClientContent from './blog-post-client-content';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://dreamydesk.co.in';

export async function generateMetadata(
  { params }: { params: { slug: string } },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const post = await getBlogPostBySlug(params.slug);

  if (!post || post.status !== 'published') {
    return {
      title: 'Blog Post Not Found',
    }
  }
 
  const previousImages = (await parent).openGraph?.images || [];
  const postUrl = `${siteUrl}/blog/${post.slug}`;
 
  const createdAtDate = post.createdAt instanceof Date ? post.createdAt : new Date((post.createdAt as any)?._seconds * 1000 || post.createdAt);
  const updatedAtDate = post.updatedAt instanceof Date ? post.updatedAt : new Date((post.updatedAt as any)?._seconds * 1000 || post.updatedAt);

  return {
    title: post.title,
    description: post.excerpt,
    alternates: {
      canonical: postUrl,
    },
    openGraph: {
       title: `${post.title} - DreamyDesk Blog`,
       description: post.excerpt,
       url: postUrl,
       images: [post.thumbnailUrl, ...previousImages],
       type: 'article',
       publishedTime: createdAtDate.toISOString(),
       modifiedTime: updatedAtDate.toISOString(),
    },
  }
}


export default async function BlogPostPage({ params }: { params: { slug: string } }) {
    const post = await getBlogPostBySlug(params.slug);
    
    if (!post || post.status !== 'published') {
        notFound();
    }

    const featuredWallpapers = await getWallpapersByIds(post.wallpaperIds);
    const createdAtDate = post.createdAt instanceof Date ? post.createdAt : new Date((post.createdAt as any)?._seconds * 1000 || post.createdAt);

    return (
        <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 space-y-12">
            <Link href="/blog">
                <Button variant="ghost">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Blog
                </Button>
            </Link>

            <BlogPostClientContent 
                post={post}
                createdAtDate={createdAtDate}
                featuredWallpapers={featuredWallpapers}
            />
        </div>
    );
}
