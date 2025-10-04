
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getTopSearchQueries } from "@/services/analytics-service";
import { Search as SearchIcon } from "lucide-react";

export async function TopSearchesCard() {
    const topSearches = await getTopSearchQueries(10);
    
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><SearchIcon className="w-5 h-5" />Top Searches</CardTitle>
                <CardDescription>Most frequent user search queries (all-time).</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Rank</TableHead>
                            <TableHead>Query</TableHead>
                            <TableHead className="text-right">Count</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {topSearches.map((s, i) => (
                            <TableRow key={s.query}>
                                <TableCell className="font-bold text-muted-foreground">{i + 1}</TableCell>
                                <TableCell className="font-medium capitalize">{s.query}</TableCell>
                                <TableCell className="text-right font-bold">{s.count}</TableCell>
                            </TableRow>
                        ))}
                        {topSearches.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                                    No search data yet.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
