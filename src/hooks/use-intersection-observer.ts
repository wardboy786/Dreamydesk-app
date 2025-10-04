
"use client";

import { useEffect, useState, RefObject } from 'react';

interface IntersectionObserverOptions extends IntersectionObserverInit {
  freezeOnceVisible?: boolean;
}

/**
 * A custom React hook that uses the Intersection Observer API to track whether an element is visible in the viewport.
 *
 * @param {RefObject<Element>} elementRef - A React ref pointing to the DOM element to observe.
 * @param {IntersectionObserverOptions} [options] - Configuration options for the Intersection Observer.
 * @param {boolean} [options.freezeOnceVisible=false] - If true, the observer will stop tracking once the element becomes visible.
 * @returns {IntersectionObserverEntry | undefined} The latest IntersectionObserverEntry for the observed element.
 */
function useIntersectionObserver(
  elementRef: RefObject<Element>,
  {
    threshold = 0,
    root = null,
    rootMargin = '0%',
    freezeOnceVisible = false,
  }: IntersectionObserverOptions = {},
): IntersectionObserverEntry | undefined {
  const [entry, setEntry] = useState<IntersectionObserverEntry>();

  const frozen = entry?.isIntersecting && freezeOnceVisible;

  useEffect(() => {
    const node = elementRef?.current; 
    const hasIOSupport = !!window.IntersectionObserver;

    if (!hasIOSupport || frozen || !node) return;

    const observer = new IntersectionObserver(([entry]) => {
      setEntry(entry);
    }, { threshold, root, rootMargin });

    observer.observe(node);

    return () => observer.disconnect();

  }, [elementRef, JSON.stringify(threshold), root, rootMargin, frozen]);

  return entry;
}

export default useIntersectionObserver;
