
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export function BannerAdSkeleton() {
    return (
        <div className="w-[320px] h-[50px] border-2 border-dashed rounded-lg flex items-center justify-center bg-muted/50 p-2">
            <div className="flex items-center gap-4 w-full">
                <Skeleton className="h-8 w-8 rounded" />
                <div className="flex-1 space-y-1">
                    <Skeleton className="h-3 w-3/4" />
                    <Skeleton className="h-2 w-1/2" />
                </div>
                 <p className="text-xs font-bold tracking-widest text-muted-foreground/50">AD</p>
            </div>
        </div>
    );
}
