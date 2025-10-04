
"use client";

import { logCollectionView } from "@/services/analytics-service";

interface CollectionClickLoggerProps {
    children: React.ReactNode;
    collectionId: string;
}

/**
 * A client component that wraps a server component (like a Link)
 * to attach an onClick event for analytics without making the parent component
 * a client component.
 */
export default function CollectionClickLogger({ children, collectionId }: CollectionClickLoggerProps) {
    const handleClick = () => {
        logCollectionView(collectionId);
    };

    return (
        <div onClick={handleClick}>
            {children}
        </div>
    );
}
