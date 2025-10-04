
import Link from "next/link";
import OptimizedImage from "@/components/optimized-image";
import { Card } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { CuratedCollection } from "@/lib/types";
import CollectionClickLogger from "./collection-click-logger";

// This is now a "dumb" component that just receives data.
interface CollectionsGridProps {
  collections: CuratedCollection[];
}

export default function CollectionsGrid({ collections }: CollectionsGridProps) {
    if (collections.length === 0) {
        return null;
    }

    return (
        <section>
            <div className="text-center mb-8">
                <h2 className="font-headline text-3xl font-bold">Curated Collections</h2>
                <p className="text-muted-foreground">Explore beautifully themed collections.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 items-start">
                {/* The CollectionClickLogger is a client component to handle the onClick analytics event without making the whole grid a client component. */}
                <CollectionClickLogger collectionId={collections[0].id}>
                    <Link href={`/collections/${collections[0].id}`} className="md:col-span-1">
                        <Card className="overflow-hidden group transition-all duration-300 hover:shadow-xl hover:-translate-y-1 relative w-full">
                            <AspectRatio ratio={16 / 9}>
                                <OptimizedImage 
                                    src={collections[0].thumbnailUrl} 
                                    alt={collections[0].title} 
                                    fill 
                                    priority // Prioritize this large, above-the-fold image
                                    className="object-cover transition-transform duration-300 group-hover:scale-105" 
                                    data-ai-hint="collection abstract" 
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent p-4 md:p-6 flex flex-col justify-end">
                                    <h3 className="font-bold text-lg md:text-2xl text-white drop-shadow-md">{collections[0].title}</h3>
                                    <p className="text-sm md:text-md text-white/90 drop-shadow-md mt-1">{collections[0].description}</p>
                                </div>
                            </AspectRatio>
                        </Card>
                    </Link>
                </CollectionClickLogger>
                <div className="grid grid-cols-2 gap-4 md:col-span-1">
                    {collections.slice(1, 5).map((collection: CuratedCollection) => (
                         <CollectionClickLogger collectionId={collection.id} key={collection.id}>
                            <Link href={`/collections/${collection.id}`}>
                                <Card className="overflow-hidden group transition-all duration-300 hover:shadow-xl hover:-translate-y-1 relative">
                                    <AspectRatio ratio={1 / 1}>
                                        <OptimizedImage src={collection.thumbnailUrl} alt={collection.title} fill className="object-cover transition-transform duration-300 group-hover:scale-105" data-ai-hint="collection abstract" sizes="(max-width: 768px) 50vw, 25vw"/>
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent p-4 flex flex-col justify-end">
                                            <h3 className="font-bold text-base md:text-lg text-white drop-shadow-md">{collection.title}</h3>
                                        </div>
                                    </AspectRatio>
                                </Card>
                            </Link>
                        </CollectionClickLogger>
                    ))}
                </div>
            </div>
        </section>
    );
}
