
import { getAllWallpapers } from '@/services/wallpaper.service';
import { getAllCategories } from '@/services/category.service';
import { getAllCollections } from '@/services/collection.service';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://dreamydesk.co.in';

function generateSitemapXml(
  wallpapers: any[],
  categories: any[],
  collections: any[]
): string {
  const wallpaperUrls = wallpapers
    .map(
      (wallpaper) => `
    <url>
      <loc>${siteUrl}/wallpaper/${wallpaper.id}</loc>
      <lastmod>${new Date(wallpaper.createdAt).toISOString()}</lastmod>
      <changefreq>monthly</changefreq>
      <priority>0.8</priority>
    </url>
  `
    )
    .join('');

  const categoryUrls = categories
    .map(
      (category) => `
    <url>
      <loc>${siteUrl}/category/${category.id}</loc>
      <lastmod>${new Date().toISOString()}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>0.7</priority>
    </url>
  `
    )
    .join('');

  const collectionUrls = collections
    .map(
      (collection) => `
    <url>
      <loc>${siteUrl}/collections/${collection.id}</loc>
      <lastmod>${new Date().toISOString()}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>0.7</priority>
    </url>
  `
    )
    .join('');

  const staticPages = [
    '/',
    '/menu',
    '/menu/about',
    '/menu/contact',
    '/menu/privacy',
    '/menu/terms',
    '/menu/dmca',
    '/menu/premium',
    '/menu/request',
  ]
    .map(
      (route) => `
    <url>
      <loc>${siteUrl}${route}</loc>
      <lastmod>${new Date().toISOString()}</lastmod>
      <changefreq>monthly</changefreq>
      <priority>${route === '/' ? 1.0 : 0.5}</priority>
    </url>
  `
    )
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${staticPages}
  ${wallpaperUrls}
  ${categoryUrls}
  ${collectionUrls}
</urlset>`;
}

export async function GET() {
  const [wallpapers, categories, collections] = await Promise.all([
    getAllWallpapers(),
    getAllCategories(),
    getAllCollections(),
  ]);

  const sitemap = generateSitemapXml(wallpapers, categories, collections);

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}
