
import { Skeleton } from "@/components/ui/skeleton";

export function WallpaperPageSkeleton() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
      <div className="mb-8 w-24 h-10">
        <Skeleton className="h-full w-full" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 items-start">
        <div className="lg:col-span-2 flex justify-center">
            <div className="w-full max-w-md">
                 <Skeleton className="w-full aspect-[9/16] rounded-lg" />
            </div>
        </div>
        
        <div className="lg:col-span-1">
          <div className="flex flex-col gap-6">
            <div className="space-y-4">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-24 rounded-full" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            </div>

            <Skeleton className="h-24 w-full" />
            
            <div className="flex gap-2">
                <Skeleton className="h-10 flex-1" />
                <Skeleton className="h-10 w-10" />
                <Skeleton className="h-10 w-10" />
            </div>
          </div>
        </div>
      </div>
       <section className="mt-16">
        <Skeleton className="h-10 w-1/2 mx-auto mb-6" />
        <div className="grid grid-cols-2 gap-4 md:gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          <Skeleton className="w-full aspect-[9/16] rounded-lg" />
          <Skeleton className="w-full aspect-[9/16] rounded-lg" />
          <Skeleton className="w-full aspect-[9/16] rounded-lg" />
          <Skeleton className="w-full aspect-[9/16] rounded-lg" />
        </div>
      </section>
    </div>
  );
}
