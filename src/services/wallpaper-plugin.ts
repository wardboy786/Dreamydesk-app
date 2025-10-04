
import { registerPlugin } from '@capacitor/core';

export interface WallpaperPlugin {
  setWallpaper(options: { base64: string }): Promise<{ success: boolean }>;
}

const Wallpaper = registerPlugin<WallpaperPlugin>('Wallpaper');

export default Wallpaper;
