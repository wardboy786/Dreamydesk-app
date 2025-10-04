
import { Skeleton } from "@/components/ui/skeleton";

export function CategoryGridSkeleton() {
    return (
        <section>
            <div className="text-center mb-8">
                 <Skeleton className="h-9 w-3/4 mx-auto" />
                <Skeleton className="h-4 w-1/2 mx-auto mt-2" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {[...Array(8)].map((_, i) => (
                    <Skeleton key={i} className="aspect-[4/3] w-full rounded-lg" />
                ))}
            </div>
        </section>
    );
}
