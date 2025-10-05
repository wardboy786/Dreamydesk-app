
import type { Metadata, ResolvingMetadata } from 'next';
import CategoryPageComponent from './page-client';
import { Suspense } from 'react';
import { getCategoryById } from '@/services/category.service';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://dreamydesk.co.in';

export const dynamic = 'force-dynamic'; // Ensures the page is rendered dynamically

export async function generateMetadata(
  { params }: { params: { id: string } },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const id = params.id
  const category = await getCategoryById(id)

  if (!category) {
    return {
      title: 'Category Not Found',
    }
  }
 
  const previousImages = (await parent).openGraph?.images || []
  const categoryUrl = `${siteUrl}/category/${id}`;
  const ogImageUrl = category.imageUrl;
 
  return {
    title: `${category.name} Wallpapers`,
    description: `Browse a collection of high-quality ${category.name} wallpapers. Find the perfect background for your desktop or mobile device.`,
    alternates: {
      canonical: categoryUrl,
    },
    openGraph: {
       title: `${category.name} Wallpapers - DreamyDesk`,
       description: `Browse a collection of high-quality ${category.name} wallpapers for your desktop or mobile device.`,
       url: categoryUrl,
       images: [ogImageUrl, ...previousImages],
    },
  }
}

export default function CategoryPage({ params }: { params: { id: string } }) {
    return (
      <>
        <Suspense fallback={null}>
          <CategoryStructuredData id={params.id} />
        </Suspense>
        <CategoryPageComponent id={params.id} />
      </>
    )
}

async function CategoryStructuredData({ id }: { id: string }) {
  const category = await getCategoryById(id);
  if (!category) return null;

  const breadcrumbJsonLd = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": siteUrl
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": category.name
        }
      ]
  };

  return (
    <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
    />
  );
}
