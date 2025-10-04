
"use client";

import { LineChart, Line, CartesianGrid, XAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO } from 'date-fns';
import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

const chartConfig = {
  views: {
    label: "Views",
    color: "hsl(var(--chart-2))",
  },
  downloads: {
    label: "Downloads",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

interface PerformanceTrendChartProps {
    downloadsData: { date: string; count: number }[];
    viewsData: { date: string; count: number }[];
}

export function PerformanceTrendChart({ downloadsData, viewsData }: PerformanceTrendChartProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const monthlyData = useMemo(() => {
        const start = startOfMonth(currentMonth);
        const end = endOfMonth(currentMonth);
        const daysInInterval = eachDayOfInterval({ start, end });

        const viewsMap = new Map(viewsData.map(item => [item.date, item.count]));
        const downloadsMap = new Map(downloadsData.map(item => [item.date, item.count]));

        return daysInInterval.map(day => {
            const dateKey = format(day, 'yyyy-MM-dd');
            return {
                date: format(day, 'd'),
                fullDate: format(day, 'MMM d, yyyy'),
                views: viewsMap.get(dateKey) || 0,
                downloads: downloadsMap.get(dateKey) || 0,
            };
        });
  }, [downloadsData, viewsData, currentMonth]);
  
  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  }

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  }

  const totalMonthDownloads = useMemo(() => monthlyData.reduce((acc, curr) => acc + curr.downloads, 0), [monthlyData]);
  const totalMonthViews = useMemo(() => monthlyData.reduce((acc, curr) => acc + curr.views, 0), [monthlyData]);


  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
            <div>
                <CardTitle>Performance Trends</CardTitle>
                <CardDescription>{format(currentMonth, 'MMMM yyyy')}: {totalMonthViews.toLocaleString()} views & {totalMonthDownloads.toLocaleString()} downloads</CardDescription>
            </div>
            <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={handlePrevMonth}>
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                 <Button variant="outline" size="icon" onClick={handleNextMonth}>
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-72 w-full">
          <ResponsiveContainer>
            <LineChart
                accessibilityLayer
                data={monthlyData}
                margin={{
                left: 12,
                right: 12,
                top: 10
                }}
            >
                <CartesianGrid vertical={false} />
                <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                interval="preserveStartEnd"
                />
                <Tooltip
                    cursor={false}
                    content={
                        <ChartTooltipContent 
                            indicator="line" 
                        />
                    }
                />
                 <Legend verticalAlign="top" height={36} />
                <Line
                    dataKey="views"
                    type="monotone"
                    stroke="hsl(var(--chart-2))"
                    strokeWidth={2}
                    dot={false}
                    name="Views"
                />
                <Line
                    dataKey="downloads"
                    type="monotone"
                    stroke="hsl(var(--chart-1))"
                    strokeWidth={2}
                    dot={false}
                    name="Downloads"
                />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
