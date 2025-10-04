
import { Skeleton } from "@/components/ui/skeleton";

export function FeaturedCarouselSkeleton() {
    return (
        <section>
            <div className="text-center mb-8">
                <Skeleton className="h-9 w-3/4 mx-auto" />
                <Skeleton className="h-4 w-1/2 mx-auto mt-2" />
            </div>
            <div className="w-full overflow-hidden">
                <div className="flex -ml-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="pl-4 basis-1/2 md:basis-1/3 lg:basis-1/4">
                            <Skeleton className="aspect-[9/16] w-full rounded-lg" />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
