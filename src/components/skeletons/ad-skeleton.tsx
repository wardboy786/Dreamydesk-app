
import { Skeleton } from "@/components/ui/skeleton";

export function AdSkeleton() {
    return (
        <div className="w-[300px] h-[250px] border-2 border-dashed rounded-lg flex items-center justify-center bg-muted/50 p-4">
            <div className="text-center text-muted-foreground space-y-2">
                <Skeleton className="h-4 w-24 mx-auto" />
                <Skeleton className="h-3 w-32 mx-auto" />
                <div className="pt-4">
                    <Skeleton className="h-20 w-full" />
                </div>
                <p className="text-xs font-bold tracking-widest pt-2">ADVERTISEMENT</p>
            </div>
        </div>
    );
}
