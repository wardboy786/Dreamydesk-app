
import type { Metadata, ResolvingMetadata } from 'next';
import CollectionPageComponent from './page-client';
import { Suspense } from 'react';
import { getCollectionById } from '@/services/collection.service';

type Props = {
  params: { id: string }
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://dreamydesk.co.in';

export const dynamic = 'force-dynamic'; // Ensures the page is rendered dynamically

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const id = params.id
  const collection = await getCollectionById(id);

  if (!collection) {
    return {
      title: 'Collection Not Found',
    }
  }
 
  const previousImages = (await parent).openGraph?.images || []
  const collectionUrl = `${siteUrl}/collections/${id}`;
  const ogImageUrl = collection.thumbnailUrl;
 
  return {
    title: `${collection.title} Collection`,
    description: collection.description || `Explore the "${collection.title}" collection of hand-picked wallpapers.`,
    alternates: {
      canonical: collectionUrl,
    },
    openGraph: {
       title: `${collection.title} Collection - DreamyDesk`,
       description: collection.description,
       url: collectionUrl,
       images: [ogImageUrl, ...previousImages],
    },
  }
}

export default function CollectionPage({ params }: Props) {
    return (
      <>
         <Suspense fallback={null}>
          <CollectionStructuredData id={params.id} />
        </Suspense>
        <CollectionPageComponent id={params.id} />
      </>
    )
}

async function CollectionStructuredData({ id }: { id: string }) {
  const collection = await getCollectionById(id);
  if (!collection) return null;

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
          "name": collection.title
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
