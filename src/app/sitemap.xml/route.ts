
import { getAllWallpapers } from '@/services/wallpaper.service'
import { getAllCategories } from '@/services/category.service'
import { getAllCollections } from '@/services/collection.service'
import { Wallpaper, Category, CuratedCollection } from '@/lib/types';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://dreamydesk.co.in';

// Helper function to escape XML special characters
const escapeXml = (unsafe: string) => {
  if (typeof unsafe !== 'string') {
    return '';
  }
  return unsafe.replace(/[<>&"']/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '"': return '&quot;';
      case "'": return '&apos;';
      default: return c;
    }
  });
};

function generateSiteMap(
    wallpapers: Wallpaper[], 
    categories: Category[], 
    collections: CuratedCollection[]
) {
  const now = new Date().toISOString();
  return `<?xml version="1.0" encoding="UTF-8"?>
   <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
     <url>
       <loc>${escapeXml(siteUrl)}</loc>
       <lastmod>${now}</lastmod>
       <changefreq>daily</changefreq>
       <priority>1.0</priority>
     </url>
     ${wallpapers
       .map(({ id, updatedAt }) => {
         const lastMod = updatedAt instanceof Date ? updatedAt.toISOString() : now;
         return `
           <url>
               <loc>${escapeXml(`${siteUrl}/wallpaper/${id}`)}</loc>
                <lastmod>${lastMod}</lastmod>
               <changefreq>monthly</changefreq>
               <priority>0.7</priority>
           </url>
         `;
       })
       .join('')}
      ${categories
       .map(({ id }) => {
         return `
           <url>
               <loc>${escapeXml(`${siteUrl}/category/${id}`)}</loc>
                <lastmod>${now}</lastmod>
               <changefreq>weekly</changefreq>
                <priority>0.6</priority>
           </url>
         `;
       })
       .join('')}
        ${collections
       .map(({ id }) => {
         return `
           <url>
               <loc>${escapeXml(`${siteUrl}/collections/${id}`)}</loc>
                <lastmod>${now}</lastmod>
               <changefreq>weekly</changefreq>
                <priority>0.6</priority>
           </url>
         `;
       })
       .join('')}
   </urlset>
 `;
}

export async function GET() {
    try {
        const [wallpapers, categories, collections] = await Promise.all([
            getAllWallpapers(),
            getAllCategories(),
            getAllCollections(),
        ]);

        const sitemap = generateSiteMap(wallpapers, categories, collections);

        return new Response(sitemap, {
            headers: {
                'Content-Type': 'application/xml',
                'Cache-Control': 's-maxage=86400, stale-while-revalidate', // Cache for 24 hours
            },
        });
    } catch (error) {
        console.error("Error generating dynamic sitemap:", error);
        return new Response("Error generating sitemap", { status: 500 });
    }
}
