
import { Suspense } from 'react';
import DashboardContainer from '@/components/admin/dashboard-container';
import { CollectionAnalyticsCard } from '@/components/admin/analytics/collection-analytics-card';
import { TopSearchesCard } from '@/components/admin/analytics/top-searches-card';
import { Skeleton } from '@/components/ui/skeleton';
import { addDays } from 'date-fns';

/**
 * This is now a pure Server Component. Its only job is to orchestrate the layout
 * and pass server-rendered components as children to the client container.
 */
export default function AdminDashboardPage() {
  const initialDate = {
    from: addDays(new Date(), -29),
    to: new Date(),
  };

  return (
    <DashboardContainer initialDate={initialDate}>
        {/* These server components are passed as children to the client container */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Suspense fallback={<Skeleton className="h-80" />}>
              <CollectionAnalyticsCard />
            </Suspense>
            <Suspense fallback={<Skeleton className="h-80" />}>
              <TopSearchesCard />
            </Suspense>
        </div>
    </DashboardContainer>
  );
}
