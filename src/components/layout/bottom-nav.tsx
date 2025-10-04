
"use client";

import Link from "next/link";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface NavItem {
    name: string;
    icon: React.ReactNode;
    value: string;
}

interface BottomNavProps {
    items: NavItem[];
    activeTab: string;
    setActiveTab: (value: string) => void;
}

export function BottomNav({ items, activeTab, setActiveTab }: BottomNavProps) {
    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-2 bg-background/80 backdrop-blur-sm border-t border-border">
            <div className="flex justify-center">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
                    <TabsList className="grid w-full grid-cols-5 h-16">
                        {items.map((item) => {
                            if (item.value === 'Menu') {
                                return (
                                    <Link href="/menu" key={item.name} className={cn(
                                        "inline-flex flex-col items-center justify-center gap-1 whitespace-nowrap rounded-sm px-3 py-1.5 text-xs font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-full",
                                        "data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                                    )}>
                                        {item.icon}
                                        <span>{item.name}</span>
                                    </Link>
                                )
                            }
                            return (
                                <TabsTrigger key={item.name} value={item.value} className="flex-col h-full gap-1 text-xs">
                                    {item.icon}
                                    <span>{item.name}</span>
                                </TabsTrigger>
                            )
                        })}
                    </TabsList>
                </Tabs>
            </div>
        </div>
    );
}
