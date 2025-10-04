

import { getBlogPostBySlug, getPublishedBlogPosts } from '@/services/blog.service';
import { getWallpapersByIds } from '@/services/wallpaper.service';
import type { Metadata, ResolvingMetadata } from 'next';
import { notFound } from 'next/navigation';
import OptimizedImage from '@/components/optimized-image';
import Link from 'next/link';
import { ArrowLeft, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import WallpaperGrid from '@/components/wallpaper-grid';
import ReactMarkdown from 'react-markdown';
import { Suspense } from 'react';

type Props = {
  params: { slug: string }
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://dreamydesk.co.in';

export async function generateMetadata(
  { params }: Props,
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
 
  // Ensure createdAt and updatedAt are Date objects before calling toISOString
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

// Custom renderer for the markdown content
const renderers = {
  // This renderer specifically targets image tags `![]()`
  img: ({ alt, src }: { alt?: string; src?: string }) => {
    // If the image tag has an alt text and a src that looks like a wallpaper ID,
    // we return null because we will render these wallpapers in a grid below the content.
    if (alt && src && !src.startsWith('http')) {
      return null;
    }
    // For regular images (e.g., those with full URLs), we render them as standard images.
    return <img src={src} alt={alt} className="rounded-lg shadow-md" />;
  },
};


export default async function BlogPostPage({ params }: Props) {
    const post = await getBlogPostBySlug(params.slug);
    
    if (!post || post.status !== 'published') {
        notFound();
    }

    const featuredWallpapers = await getWallpapersByIds(post.wallpaperIds);

    // This regex finds our custom wallpaper syntax, e.g., ![Wallpaper Title](wallpaper_id)
    const wallpaperIdRegex = /!\[.*?\]\((.*?)\)/g;
    const contentWithoutWallpaperTags = post.content.replace(wallpaperIdRegex, '');
    const createdAtDate = post.createdAt instanceof Date ? post.createdAt : new Date((post.createdAt as any)?._seconds * 1000 || post.createdAt);

    return (
        <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 space-y-12">
            <Link href="/blog">
                <Button variant="ghost">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Blog
                </Button>
            </Link>

            <article>
                <header className="mb-8">
                    <div className="relative w-full mb-8 overflow-hidden rounded-lg aspect-video">
                        <OptimizedImage src={post.thumbnailUrl} alt={post.title} fill className="object-cover" priority sizes="(max-width: 768px) 100vw, 50vw"/>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold font-headline mb-4">{post.title}</h1>
                    <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4 mr-2"/>
                        <span>Published on {format(createdAtDate, "PPP")}</span>
                    </div>
                </header>

                <div className="prose prose-lg dark:prose-invert max-w-none">
                    <ReactMarkdown components={renderers}>
                        {contentWithoutWallpaperTags}
                    </ReactMarkdown>
                </div>
            </article>

            {featuredWallpapers.length > 0 && (
                <section>
                    <h2 className="text-3xl font-bold font-headline mb-6 text-center">Featured Wallpapers</h2>
                    <WallpaperGrid wallpapers={featuredWallpapers} priorityImageCount={4} />
                </section>
            )}
        </div>
    );
}
