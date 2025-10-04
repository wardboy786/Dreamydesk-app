
import { Skeleton } from "@/components/ui/skeleton";

export function CollectionsSkeleton() {
    return (
        <section>
            <div className="text-center mb-8">
                 <Skeleton className="h-9 w-3/4 mx-auto" />
                <Skeleton className="h-4 w-1/2 mx-auto mt-2" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                <Skeleton className="aspect-[4/3] w-full rounded-lg md:col-span-1" />
                <div className="grid grid-cols-2 gap-6 md:col-span-1">
                    <Skeleton className="aspect-[1/1] w-full rounded-lg" />
                    <Skeleton className="aspect-[1/1] w-full rounded-lg" />
                    <Skeleton className="aspect-[1/1] w-full rounded-lg" />
                    <Skeleton className="aspect-[1/1] w-full rounded-lg" />
                </div>
            </div>
        </section>
    )
}
