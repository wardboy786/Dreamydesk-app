
"use client";

import dynamic from 'next/dynamic';
import { FeaturedCarouselSkeleton } from '../skeletons/featured-carousel-skeleton';

// This is the correct place for ssr:false.
// This Client Component dynamically loads another component that should not be server-rendered.
const FeaturedCarousel = dynamic(() => import('@/components/home/featured-carousel'), {
  loading: () => <FeaturedCarouselSkeleton />,
  ssr: false,
});

export default FeaturedCarousel;
