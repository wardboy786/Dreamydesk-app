
import { Wallpaper } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Eye, Download, Heart, Crop } from "lucide-react";

interface WallpaperDetailsProps {
    wallpaper: Wallpaper;
}

export default function WallpaperDetails({ wallpaper }: WallpaperDetailsProps) {
    return (
        <div className="space-y-6 text-left">
            <div>
                <h1 className="font-headline text-3xl font-bold">{wallpaper.title}</h1>
                {wallpaper.description && (
                    <p className="text-muted-foreground mt-2">{wallpaper.description}</p>
                )}
            </div>

            <div className="flex flex-wrap gap-2">
                {(wallpaper.tags || []).map((tag, index) => (
                    <Badge key={`${tag}-${index}`} variant="secondary" className="text-sm">{tag}</Badge>
                ))}
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
                    <Eye className="w-5 h-5 text-muted-foreground" />
                    <div>
                        <span className="font-bold">{Intl.NumberFormat('en-US', { notation: 'compact' }).format(wallpaper.views || 0)}</span>
                        <p className="text-xs text-muted-foreground">Views</p>
                    </div>
                </div>
                 <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
                    <Download className="w-5 h-5 text-muted-foreground" />
                    <div>
                        <span className="font-bold">{Intl.NumberFormat('en-US', { notation: 'compact' }).format(wallpaper.downloads || 0)}</span>
                        <p className="text-xs text-muted-foreground">Downloads</p>
                    </div>
                </div>
                 <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
                    <Heart className="w-5 h-5 text-muted-foreground" />
                    <div>
                        <span className="font-bold">{Intl.NumberFormat('en-US', { notation: 'compact' }).format(wallpaper.likes || 0)}</span>
                        <p className="text-xs text-muted-foreground">Likes</p>
                    </div>
                </div>
                 <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
                    <Crop className="w-5 h-5 text-muted-foreground" />
                    <div>
                        <span className="font-bold">{wallpaper.resolution}</span>
                        <p className="text-xs text-muted-foreground">Resolution</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
