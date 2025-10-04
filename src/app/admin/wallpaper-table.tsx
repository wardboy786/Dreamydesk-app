
import { Wallpaper } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { format } from "date-fns";
import { WallpaperActions } from "./wallpaper-actions";
import { Eye, Download, Heart } from "lucide-react";
import { getCdnUrl } from "@/lib/cdn";

interface WallpaperTableProps {
  title: string;
  description?: string;
  wallpapers: Wallpaper[];
  showActions?: boolean;
  onDelete?: (wallpaperId: string) => void;
  showViews?: boolean;
  showDownloads?: boolean;
  showLikes?: boolean;
}

export function WallpaperTable({
  title,
  description,
  wallpapers,
  showActions = false,
  onDelete,
  showViews = false,
  showDownloads = false,
  showLikes = false,
}: WallpaperTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="hidden w-[100px] sm:table-cell">
                <span className="sr-only">Image</span>
              </TableHead>
              <TableHead>Title</TableHead>
              {showViews && <TableHead className="text-right">Views</TableHead>}
              {showDownloads && <TableHead className="text-right">Downloads</TableHead>}
              {showLikes && <TableHead className="text-right">Likes</TableHead>}
              {!showViews && !showDownloads && !showLikes && (
                <>
                  <TableHead>Category</TableHead>
                  <TableHead className="hidden md:table-cell">Created at</TableHead>
                </>
              )}
              {showActions && (
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {wallpapers.map((wallpaper) => (
              <TableRow key={wallpaper.id}>
                <TableCell className="hidden sm:table-cell">
                  <Image
                    alt={wallpaper.title}
                    className="aspect-square rounded-md object-cover"
                    height="64"
                    src={getCdnUrl(wallpaper.thumbnailUrl || wallpaper.imageUrl, { width: 64, height: 64 })}
                    width="64"
                    data-ai-hint={wallpaper.aiHint}
                  />
                </TableCell>
                <TableCell className="font-medium">{wallpaper.title}</TableCell>
                
                {showViews && (
                  <TableCell className="text-right font-bold">
                    <div className="flex items-center justify-end gap-1">
                      <Eye className="w-4 h-4 text-muted-foreground" />
                      {wallpaper.views}
                    </div>
                  </TableCell>
                )}
                {showDownloads && (
                  <TableCell className="text-right font-bold">
                     <div className="flex items-center justify-end gap-1">
                      <Download className="w-4 h-4 text-muted-foreground" />
                      {wallpaper.downloads}
                    </div>
                  </TableCell>
                )}
                {showLikes && (
                  <TableCell className="text-right font-bold">
                     <div className="flex items-center justify-end gap-1">
                      <Heart className="w-4 h-4 text-muted-foreground" />
                      {wallpaper.likes}
                    </div>
                  </TableCell>
                )}

                {!showViews && !showDownloads && !showLikes && (
                    <>
                        <TableCell>
                            <Badge variant="outline">{wallpaper.category}</Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                            {format(wallpaper.createdAt, "PPP")}
                        </TableCell>
                    </>
                )}

                {showActions && onDelete && (
                  <TableCell>
                    <div className="flex justify-end">
                      <WallpaperActions wallpaper={wallpaper} onDelete={onDelete} />
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
             {wallpapers.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No wallpapers found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
