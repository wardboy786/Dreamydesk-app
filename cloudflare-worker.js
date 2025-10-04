
/**
 * Welcome to your Cloudflare Worker for DreamyDesk!
 *
 * This worker acts as a proxy between your custom CDN domain (cdn.dreamydesk.co.in)
 * and your Firebase Storage bucket. It fetches images from Firebase and allows
 * Cloudflare to cache them aggressively, reducing your Firebase costs and speeding up
 * image delivery for your users.
 *
 * --- HOW TO DEPLOY THIS WORKER ---
 * 1.  Go to your Cloudflare Dashboard.
 * 2.  In the left sidebar, navigate to "Workers & Pages".
 * 3.  If you have an existing worker for your CDN, click on it. If not, click "Create Application", then "Create Worker".
 * 4.  Give your worker a name (e.g., "dreamydesk-image-proxy") and click "Deploy".
 * 5.  After deployment, click "Edit code".
 * 6.  Delete all the boilerplate code in the editor.
 * 7.  Copy the ENTIRE content of this file below and paste it into the Cloudflare editor.
 * 8.  Click "Save and deploy" in the top right.
 * 9.  Finally, go back to your Worker's main page, click on the "Triggers" tab, and add a route.
 *     - Route: cdn.dreamydesk.co.in/*
 *     - Zone: dreamydesk.co.in
 *
 * That's it! Your worker is now live and will handle all image requests.
 */

// IMPORTANT: Replace this with your actual Firebase Storage bucket ID.
const FIREBASE_BUCKET_ID = 'dreamydesk-fab2b.firebasestorage.app';

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);

  // The path of the image requested from the CDN (e.g., /wallpapers/image.jpg)
  // We must decode this path as it may contain URL-encoded characters like %2F for slashes.
  const objectPath = decodeURIComponent(url.pathname.substring(1));

  if (!objectPath) {
    return new Response('File path is missing.', { status: 400 });
  }

  // URL-encode the path AGAIN for the final Firebase URL. This is crucial because
  // Firebase expects the full path segment to be encoded.
  const encodedObjectPath = encodeURIComponent(objectPath);

  // Construct the full Firebase Storage URL.
  const firebaseStorageUrl = `https://firebasestorage.googleapis.com/v0/b/${FIREBASE_BUCKET_ID}/o/${encodedObjectPath}?alt=media`;

  // Use Cloudflare's fetch to get the image and cache it.
  // The `cf` object tells Cloudflare how to handle caching for this specific request.
  const imageResponse = await fetch(firebaseStorageUrl, {
    cf: {
      // Cache everything for a long time, letting Cloudflare handle eviction.
      // 1 year in seconds.
      ttl: 31536000,
      cacheEverything: true,
      // You can also specify cache tags, status code caching, etc.
      // See Cloudflare docs for more advanced options.
    },
  });

  // Create a new response so we can modify the headers.
  const response = new Response(imageResponse.body, imageResponse);

  // Set a public, long-lived cache header. This tells browsers and other CDNs
  // that it's safe to cache this response.
  response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  
  // Add other useful headers
  response.headers.set('Access-Control-Allow-Origin', '*'); // Allow cross-origin requests

  return response;
}
