
"use client";

import OptimizedImage from "@/components/optimized-image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Pencil } from "lucide-react";
import type { QueuedWallpaper } from "@/app/admin/upload/page";

interface QueuedFileCardProps {
    wallpaper: QueuedWallpaper;
    isSelected: boolean;
    onSelectionChange: (fileName: string, checked: boolean) => void;
    onDelete: (fileName: string) => void;
    onEdit: (wallpaper: QueuedWallpaper) => void;
}

export default function QueuedFileCard({ wallpaper, isSelected, onSelectionChange, onDelete, onEdit }: QueuedFileCardProps) {
    return (
        <div className="flex items-center gap-4 p-3 border rounded-lg bg-background/50 hover:bg-accent/50 transition-colors">
            <Checkbox
                checked={isSelected}
                onCheckedChange={(checked) => onSelectionChange(wallpaper.fileName, !!checked)}
                aria-label={`Select ${wallpaper.title}`}
                className="w-5 h-5"
            />
            <div className="relative w-12 h-16 rounded-md overflow-hidden flex-shrink-0">
                <OptimizedImage src={wallpaper.imageUrl} alt={wallpaper.title} fill className="object-cover" />
            </div>
            <div className="flex-1 overflow-hidden">
                <p className="font-medium truncate">{wallpaper.title}</p>
                <p className="text-sm text-muted-foreground">{wallpaper.category}</p>
            </div>
            <div className="hidden sm:flex flex-wrap gap-1 justify-end w-1/3">
                 {wallpaper.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                ))}
            </div>
             {wallpaper.premium && (
                <Badge variant="destructive">Premium</Badge>
            )}
             <Button variant="ghost" size="icon" onClick={() => onEdit(wallpaper)}>
                <Pencil className="h-4 w-4" />
             </Button>
             <Button variant="ghost" size="icon" className="text-destructive" onClick={() => onDelete(wallpaper.fileName)}>
                <Trash2 className="h-4 w-4" />
            </Button>
        </div>
    );
}
