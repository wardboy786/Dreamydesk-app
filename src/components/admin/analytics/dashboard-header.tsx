
"use client";

import { DateRange } from "react-day-picker";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, addDays } from "date-fns";
import { Calendar } from "@/components/ui/calendar";

interface DashboardHeaderProps {
    date: DateRange | undefined;
    setDate: (date: DateRange | undefined) => void;
}

export default function DashboardHeader({ date, setDate }: DashboardHeaderProps) {

    const setPresetDate = (preset: 'today' | 'yesterday' | 'last7days' | 'last30days') => {
        const today = new Date();
        switch (preset) {
            case 'today':
                setDate({ from: today, to: today });
                break;
            case 'yesterday':
                const yesterday = addDays(today, -1);
                setDate({ from: yesterday, to: yesterday });
                break;
            case 'last7days':
                setDate({ from: addDays(today, -6), to: today });
                break;
            case 'last30days':
                setDate({ from: addDays(today, -29), to: today });
                break;
        }
    }

    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
                <h1 className="text-3xl font-bold font-headline">Dashboard & Analytics</h1>
                <p className="text-muted-foreground">
                    Displaying site-wide totals and performance for the selected date range.
                </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
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
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setPresetDate('today')}>Today</Button>
                    <Button variant="outline" size="sm" onClick={() => setPresetDate('yesterday')}>Yesterday</Button>
                    <Button variant="outline" size="sm" onClick={() => setPresetDate('last7days')}>Last 7 Days</Button>
                    <Button variant="outline" size="sm" onClick={() => setPresetDate('last30days')}>Last 30 Days</Button>
                </div>
            </div>
        </div>
    );
}
