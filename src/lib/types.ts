

export interface Wallpaper {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  fileName: string; // The path to the file in Firebase Storage, e.g., "wallpapers/image.jpg"
  thumbnailUrl: string;
  resolution: string;
  aiHint: string;
  category: string;
  tags: string[];
  downloads: number;
  likes: number;
  shares: number;
  views: number;
  rating: number;
  featured?: boolean;
  premium: boolean;
  isExclusive?: boolean; // New field for exclusive wallpapers
  createdAt: Date;
  updatedAt: Date;
}

export interface WallpaperDraft extends Partial<Wallpaper> {
    id: string;
    status: 'pending' | 'processing' | 'metadata_generated' | 'error';
    imageUrl: string;
    fileName: string;
    resolution: string;
    createdAt: Date;
    error?: string;
}

export interface Category {
  id: string;
  name:string;
  wallpaperCount: number;
  imageUrl: string;
}

export interface CuratedCollection {
    id: string;
    title: string;
    description: string;
    thumbnailUrl: string;
    wallpaperCount: number;
    // Store wallpaper IDs instead of full objects
    wallpaperIds: string[];
    isPremium: boolean;
}

export type AnalyticsData = {
  name: string;
  value: number;
};

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  content: string; // Markdown or HTML content
  excerpt: string;
  thumbnailUrl: string;
  wallpaperIds: string[];
  status: 'draft' | 'published';
  createdAt: Date;
  updatedAt: Date;
}
