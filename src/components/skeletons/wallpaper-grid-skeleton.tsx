
import { Skeleton } from "@/components/ui/skeleton";

interface WallpaperGridSkeletonProps {
    count?: number;
}

export function WallpaperGridSkeleton({ count = 8 }: WallpaperGridSkeletonProps) {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {[...Array(count)].map((_, i) => (
                <Skeleton key={i} className="aspect-[9/16] w-full rounded-lg" />
            ))}
        </div>
    );
}
