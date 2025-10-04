
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getCollectionAnalytics } from "@/services/analytics-service";
import { Download, Eye, Layers } from "lucide-react";
import OptimizedImage from "@/components/optimized-image";

export async function CollectionAnalyticsCard() {
    const collectionAnalytics = await getCollectionAnalytics();

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Layers className="w-5 h-5" />Collection Performance</CardTitle>
                <CardDescription>Views and downloads within curated collections (all-time).</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Collection</TableHead>
                            <TableHead className="text-center">Views</TableHead>
                            <TableHead className="text-center">Downloads</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {collectionAnalytics.slice(0, 5).map(c => (
                            <TableRow key={c.id}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <OptimizedImage alt={c.title} className="aspect-square rounded-md object-cover" height={40} src={c.thumbnailUrl} width={40} />
                                        <span className="font-medium">{c.title}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-center font-bold">
                                    <div className="flex items-center justify-center gap-1.5"><Eye className="w-4 h-4 text-muted-foreground" />{c.views}</div>
                                </TableCell>
                                <TableCell className="text-center font-bold">
                                    <div className="flex items-center justify-center gap-1.5"><Download className="w-4 h-4 text-muted-foreground" />{c.totalDownloads}</div>
                                </TableCell>
                            </TableRow>
                        ))}
                         {collectionAnalytics.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                                    No collection data yet.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
