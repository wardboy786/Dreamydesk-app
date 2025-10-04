"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { AnalyticsData } from "@/lib/types";

const chartConfig = {
  views: {
    label: "Views",
    color: "hsl(var(--primary))",
  },
  downloads: {
    label: "Downloads",
    color: "hsl(var(--secondary))",
  },
} satisfies ChartConfig;

interface AnalyticsChartProps {
    data: AnalyticsData[];
}

export function AnalyticsChart({ data }: AnalyticsChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Website Analytics</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5, }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip content={<ChartTooltipContent />} />
                <Legend />
                <Bar dataKey="views" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="downloads" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
            </BarChart>
            </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
