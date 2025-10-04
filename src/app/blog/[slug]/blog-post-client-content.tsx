
"use client";

import ReactMarkdown from 'react-markdown';
import { format } from 'date-fns';
import { Wallpaper, BlogPost } from '@/lib/types';
import OptimizedImage from '@/components/optimized-image';
import WallpaperGrid from '@/components/wallpaper-grid';
import { Calendar } from 'lucide-react';

interface BlogPostClientContentProps {
  post: BlogPost;
  createdAtDate: Date;
  featuredWallpapers: Wallpaper[];
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

export default function BlogPostClientContent({ post, createdAtDate, featuredWallpapers }: BlogPostClientContentProps) {
    // This regex finds our custom wallpaper syntax, e.g., ![Wallpaper Title](wallpaper_id)
    const wallpaperIdRegex = /!\[.*?\]\((.*?)\)/g;
    const contentWithoutWallpaperTags = post.content.replace(wallpaperIdRegex, '');

    return (
        <>
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
        </>
    );
}
