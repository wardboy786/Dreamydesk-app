
/**
 * @fileoverview This file provides a robust, centralized function for generating
 * CDN URLs for wallpapers. It ensures that all image requests are correctly
 * routed and handled, with fallbacks for invalid data.
 */

// The base URL for your CDN. All image requests will be built from this.
const CDN_BASE_URL = 'https://cdn.dreamydesk.co.in';

interface CdnUrlOptions {
    width?: number;
    height?: number;
    quality?: number;
}

/**
 * Generates a URL for an image to be served via the Cloudflare CDN, with optional resizing.
 *
 * @param src - The original source, which can be a full Firebase URL or just a file path.
 * @param options - Optional parameters for resizing and quality.
 * @param options.width - The desired width of the image.
 * @param options.height - The desired height of the image.
 * @param options.quality - The desired quality (1-100). Defaults to 40 for thumbnails.
 * @returns A properly formatted URL pointing to the Cloudflare CDN, or a fallback image.
 */
export function getCdnUrl(
    src: string | undefined | null,
    options?: CdnUrlOptions
): string {
    const fallbackSrc = "https://placehold.co/600x400/E6E6FA/262626?text=DreamyDesk";
    
    if (typeof src !== 'string' || !src) {
        return fallbackSrc;
    }

    // If the source is not a Firebase Storage URL, we return it as-is.
    // This prevents trying to proxy/resize external images (like placeholders) incorrectly.
    if (!src.includes('firebasestorage.googleapis.com')) {
        return src;
    }

    let imagePath: string;

    try {
        // We know it's a Firebase URL, so we can safely parse it.
        // It's important to decode the URL first because paths can contain encoded slashes (%2F).
        const decodedUrl = decodeURIComponent(src);
        const urlObject = new URL(decodedUrl);
        // The path we need is after the '/o/' part in the pathname.
        const pathParts = urlObject.pathname.split('/o/');
        if (pathParts.length > 1) {
            imagePath = pathParts[1].split('?')[0]; // Remove query params like 'alt=media'
        } else {
             // This case should not happen if the URL is a valid Firebase Storage URL.
             console.warn("Could not extract image path from Firebase URL:", src);
             return src; // Fallback to original src if parsing fails.
        }
    } catch (e) {
        console.error("Invalid URL provided to getCdnUrl, returning original. URL:", src, e);
        return src; // Fallback to original src on any parsing error.
    }
    
    if (!imagePath) {
        return src; // Fallback to original src if no path was extracted.
    }

    // Build the Cloudflare Image Resizing parameters.
    const resizeParams: string[] = [`quality=${options?.quality || 40}`, 'format=webp'];
    if (options?.width) resizeParams.push(`width=${options.width}`);
    if (options?.height) resizeParams.push(`height=${options.height}`);
    if (options?.width || options?.height) resizeParams.push('fit=cover');

    const cloudflarePrefix = `/cdn-cgi/image/${resizeParams.join(',')}`;

    // Construct the final, properly formatted CDN URL.
    return `${CDN_BASE_URL}${cloudflarePrefix}/${imagePath}`;
}
