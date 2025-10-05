
import WallpaperPageComponent from './page-client';
import { Suspense } from 'react';
import { getWallpaperById } from '@/services/wallpaper.service';
import type { Metadata, ResolvingMetadata } from 'next';
import { notFound } from "next/navigation";
import { Wallpaper } from "@/lib/types";
import { getAllCategories } from "@/services/category.service";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://dreamydesk.co.in';

export const dynamic = 'force-dynamic';

export async function generateMetadata(
  { params }: { params: { id: string } },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const id = params.id
  // We still fetch here for SEO, but the page itself won't use this data for rendering.
  const wallpaper = await getWallpaperById(id, false);

  if (!wallpaper) {
    return {
      title: 'Wallpaper Not Found',
    }
  }
 
  const previousImages = (await parent).openGraph?.images || []
  const wallpaperUrl = `${siteUrl}/wallpaper/${id}`;
  const ogImageUrl = wallpaper.imageUrl;
 
  return {
    title: `${wallpaper.title} Wallpaper`,
    description: wallpaper.description || `Download ${wallpaper.title}, a stunning high-quality wallpaper. Tags: ${wallpaper.tags.join(', ')}.`,
    alternates: {
      canonical: wallpaperUrl,
    },
    openGraph: {
       title: `${wallpaper.title} Wallpaper - DreamyDesk`,
       description: wallpaper.description,
       url: wallpaperUrl,
       images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: wallpaper.title,
        },
        ...previousImages
       ],
    },
    twitter: {
       card: 'summary_large_image',
       title: `${wallpaper.title} Wallpaper - DreamyDesk`,
       description: wallpaper.description,
       images: [ogImageUrl],
    }
  }
}

export default async function WallpaperPage({ params }: { params: { id: string } }) {
    // The server component is now extremely simple.
    // It does NOT fetch data for rendering.
    // It only passes the ID to the client component.
    return (
      <>
        <Suspense fallback={null}>
           <WallpaperStructuredData id={params.id} />
        </Suspense>
        <WallpaperPageComponent initialWallpaperId={params.id} />
      </>
    )
}

async function WallpaperStructuredData({ id }: { id: string }) {
  // This can still fetch data for SEO purposes without blocking the render.
  const wallpaper = await getWallpaperById(id, false);
  if (!wallpaper) return null;

  const allCategories = await getAllCategories();
  const categoryObject = allCategories.find(c => c.name === wallpaper.category);
  const categoryId = categoryObject ? categoryObject.id : wallpaper.category.toLowerCase().replace(/\s+/g, '-');
  const cdnImageUrl = wallpaper.imageUrl;

  const imageJsonLd = {
    "@context": "https://schema.org",
    "@type": "ImageObject",
    "contentUrl": cdnImageUrl,
    "license": `${siteUrl}/menu/terms`,
    "acquireLicensePage": `${siteUrl}/menu/premium`,
    "creditText": "DreamyDesk",
    "creator": { "@type": "Organization", "name": "DreamyDesk" },
    "copyrightNotice": "DreamyDesk",
    "name": wallpaper.title,
    "description": wallpaper.description,
    "width": { "@type": "Distance", "value": wallpaper.resolution.split('x')[0] },
    "height": { "@type": "Distance", "value": wallpaper.resolution.split('x')[1] },
    "keywords": wallpaper.tags.join(', '),
    "isFamilyFriendly": "true",
  };

  const breadcrumbJsonLd = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": siteUrl },
        { "@type": "ListItem", "position": 2, "name": wallpaper.category, "item": `${siteUrl}/category/${categoryId}`},
        { "@type": "ListItem", "position": 3, "name": wallpaper.title }
      ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(imageJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
    </>
  );
}
