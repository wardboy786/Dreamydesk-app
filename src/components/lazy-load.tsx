
"use client";

import { useRef } from 'react';
import useIntersectionObserver from '@/hooks/use-intersection-observer';

interface LazyLoadProps {
  children: React.ReactNode;
  placeholder?: React.ReactNode;
  rootMargin?: string;
  threshold?: number | number[];
}

/**
 * A wrapper component that delays rendering its children until it is visible in the viewport.
 * This is useful for performance optimization, especially for components that are off-screen initially.
 *
 * @param {LazyLoadProps} props - The component props.
 * @param {React.ReactNode} props.children - The content to be lazy-loaded.
 * @param {React.ReactNode} [props.placeholder=null] - A placeholder to show while the content is not yet visible.
 * @param {string} [props.rootMargin='200px'] - Margin around the root. Can be used to start loading content before it enters the viewport.
 * @param {number | number[]} [props.threshold=0.01] - The intersection ratio at which the content should be loaded.
 * @returns {React.ReactElement} The rendered component.
 */
export default function LazyLoad({
  children,
  placeholder = null,
  rootMargin = '200px', // Start loading when the component is 200px away from the viewport
  threshold = 0.01
}: LazyLoadProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const entry = useIntersectionObserver(ref, {
    freezeOnceVisible: true, // Stop observing once the component is visible
    rootMargin,
    threshold
  });

  const isVisible = !!entry?.isIntersecting;

  return (
    <div ref={ref}>
      {isVisible ? children : placeholder}
    </div>
  );
}
