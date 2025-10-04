
"use client";

import Image from 'next/image';
import { getCdnUrl } from "@/lib/cdn";
import { useState } from 'react';
import { cn } from '@/lib/utils';

type OptimizedImageProps = Omit<React.ComponentProps<typeof Image>, 'loader' | 'src'> & {
  src: string;
};

// This updated component uses Next.js's built-in blur placeholder feature.
const OptimizedImage = ({ src, className, width, height, ...rest }: OptimizedImageProps) => {
  const [isLoading, setIsLoading] = useState(true);

  const customLoader = ({ src: loaderSrc, width: loaderWidth, quality }: { src: string; width: number; quality?: number }) => {
    // If a specific width is passed to the component, use it for the CDN request. Otherwise, use what Next.js provides.
    return getCdnUrl(loaderSrc, { width: (width as number) || loaderWidth, quality });
  };
  
  const fallbackSrc = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mN8+A8AAqsBS/2f2NYAAAAASUVORK5CYII="; // A 1x1 transparent pixel

  if (typeof src !== "string" || !src) {
    return <Image loader={customLoader} src={fallbackSrc} width={width} height={height} {...rest} />;
  }

  const imageProps = { ...rest };

  if (imageProps.fill) {
    delete (imageProps as any).width;
    delete (imageProps as any).height;
  }

  return (
    <Image
      loader={customLoader}
      src={src}
      width={width}
      height={height}
      placeholder="blur"
      blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8+PZ/PQAIZgOFs2cPjAAAAABJRU5ErkJggg==" // A minimal blurred placeholder
      onLoad={() => setIsLoading(false)}
      className={cn(
        className,
        "transition-opacity duration-300",
        isLoading ? "opacity-0" : "opacity-100"
      )}
      {...imageProps}
    />
  );
};

export default OptimizedImage;
