import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_,i) => <Skeleton key={i} className="h-28" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Skeleton className="h-96" />
        <Skeleton className="h-96" />
      </div>
       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Skeleton className="h-80" />
        <Skeleton className="h-80" />
       </div>
    </div>
  )
}
