
"use client";

import { useState, useEffect } from "react";
import { getDownloadsByDateRange, DownloadData } from "@/services/analytics-service";
import { WallpaperTable } from "@/components/admin/wallpaper-table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { DateRange } from "react-day-picker";
import { addDays, format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Calendar as CalendarIcon, Download, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function MostDownloadedPage() {
    const [date, setDate] = useState<DateRange | undefined>({
        from: addDays(new Date(), -29),
        to: new Date(),
    });
    const [downloads, setDownloads] = useState<DownloadData[]>([]);
    const [totalDownloads, setTotalDownloads] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!date?.from || !date?.to) return;
        setLoading(true);
        getDownloadsByDateRange(date.from, date.to)
            .then(({ results, totalDownloads }) => {
                setDownloads(results);
                setTotalDownloads(totalDownloads);
            })
            .finally(() => setLoading(false));
    }, [date]);

    // This is needed because the DownloadData type adds a `downloadCount` property,
    // but the WallpaperTable expects a regular `Wallpaper[]` type.
    // We can map the data, but for this specific view, it's better to show `downloadCount`.
    // Let's create a custom table or modify the existing one. For now, let's show the standard table.
    const wallpapersForTable = downloads.map(({ downloadCount, ...wallpaper }) => wallpaper);

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold font-headline flex items-center gap-2">
                        <Download className="w-8 h-8 text-primary" />
                        Download Analytics
                    </h1>
                    <p className="text-muted-foreground">
                        Most downloaded wallpapers for the selected date range.
                    </p>
                </div>
                 <Popover>
                    <PopoverTrigger asChild>
                        <Button
                        id="date"
                        variant={"outline"}
                        className={cn(
                            "w-full sm:w-[300px] justify-start text-left font-normal",
                            !date && "text-muted-foreground"
                        )}
                        >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date?.from ? (
                            date.to ? (
                            <>
                                {format(date.from, "LLL dd, y")} -{" "}
                                {format(date.to, "LLL dd, y")}
                            </>
                            ) : (
                            format(date.from, "LLL dd, y")
                            )
                        ) : (
                            <span>Pick a date</span>
                        )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                        <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={date?.from}
                        selected={date}
                        onSelect={setDate}
                        numberOfMonths={2}
                        />
                    </PopoverContent>
                </Popover>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Total Downloads</CardTitle>
                    <CardDescription>Total downloads in the selected period.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-4xl font-bold">{totalDownloads.toLocaleString()}</p>
                </CardContent>
            </Card>

            {loading ? (
                <Skeleton className="h-96 w-full" />
            ) : (
                <WallpaperTable 
                    title="Top Downloaded Wallpapers"
                    wallpapers={wallpapersForTable}
                    showDownloads
                    showViews
                    showLikes
                />
            )}
        </div>
    );
}
