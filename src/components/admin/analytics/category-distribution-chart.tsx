
"use client"

import * as React from "react"
import { Label, Pie, PieChart, Sector, Cell } from "recharts"
import { PieSectorDataItem } from "recharts/types/polar/Pie"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

interface ChartData {
    name: string;
    value: number;
}

interface CategoryDistributionChartProps {
    data: ChartData[];
}

const chartConfig = {
  wallpapers: {
    label: "Wallpapers",
  },
} satisfies ChartConfig

export function CategoryDistributionChart({ data }: CategoryDistributionChartProps) {
  const id = "pie-interactive"
  const [active, setActive] = React.useState<string | null>(data.length > 0 ? data[0].name : null);
  
  const activeData = data.find(d => d.name === active);
  const activeIndex = React.useMemo(() => data.findIndex((item) => item.name === active), [active, data]);


  return (
    <Card data-chart={id} className="flex flex-col h-full">
      <CardHeader className="items-center pb-0">
        <CardTitle>Category Distribution</CardTitle>
        <CardDescription>
          Wallpapers by category
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[300px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={60}
                strokeWidth={5}
                activeIndex={activeIndex}
                activeShape={(props) => (
                    <Sector {...props} fillOpacity={0.8} />
                )}
                 onMouseOver={(_, index) => setActive(data[index].name)}
                 onMouseLeave={() => setActive(null)}
            >
             {data.map((entry, index) => (
                <Cell
                    key={`cell-${index}`}
                    fill={`hsl(var(--chart-${index + 1}))`}
                    name={entry.name}
                />
            ))}
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                        <>
                            <text
                                x={viewBox.cx}
                                y={viewBox.cy}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                className="fill-foreground text-3xl font-bold"
                            >
                                {activeData?.value.toLocaleString()}
                            </text>
                            <text
                                x={viewBox.cx}
                                y={viewBox.cy! + 20}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                className="fill-muted-foreground"
                            >
                                {active ? activeData?.name : 'Total'}
                            </text>
                        </>
                    )
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
