
'use client';

import { Suspense, useState } from 'react';
import { DateRange } from 'react-day-picker';
import DashboardHeader from '@/components/admin/analytics/dashboard-header';
import { Skeleton } from '@/components/ui/skeleton';
import { DashboardSkeleton } from './analytics/dashboard-skeleton';
import DashboardAnalytics from './analytics/dashboard-analytics';

interface DashboardContainerProps {
  initialDate: DateRange;
  children: React.ReactNode;
}

/**
 * This is a Client Component that holds all the interactive state
 * for the dashboard, like the selected date range. It receives server-rendered
 * components via the `children` prop.
 */
export default function DashboardContainer({ initialDate, children }: DashboardContainerProps) {
  const [date, setDate] = useState<DateRange | undefined>(initialDate);

  return (
    <div className="space-y-8">
      <DashboardHeader date={date} setDate={setDate} />
      
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardAnalytics date={date} />
      </Suspense>
      
      {/* This renders the server components (e.g., Collection/Top Searches cards) */}
      {children}
    </div>
  );
}
