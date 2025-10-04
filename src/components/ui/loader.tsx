
"use client";

import { useState, useEffect } from "react";

const loadingMessages = [
  "Dreaming up your desk...",
  "Polishing the pixels...",
  "Loading awesome wallpapers...",
  "Getting things ready...",
  "Just a moment...",
];

export function Loader() {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prevIndex) => (prevIndex + 1) % loadingMessages.length);
    }, 2500); // Change message every 2.5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col justify-center items-center w-full flex-1 py-24" style={{ transform: 'translateY(10%)' }}>
        <svg className="pl" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="pl-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" />
                    <stop offset="100%" stopColor="hsl(var(--secondary))" />
                </linearGradient>
            </defs>
            <circle className="pl__ring" r="56" cx="64" cy="64" fill="none" stroke="hsl(var(--foreground) / 0.1)" strokeWidth="16" strokeLinecap="round" />
            <path className="pl__worm" d="M92,15.492S78.194,4.967,66.743,16.887c-17.231,17.938-28.26,96.974-28.26,96.974L119.85,59.892l-99-31.588,57.528,89.832L97.8,19.349,13.636,88.51l89.012,16.015S81.908,38.332,66.1,22.337C50.114,6.156,36,15.492,36,15.492a56,56,0,1,0,56,0Z" fill="none" stroke="url(#pl-grad)" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="44 1111" strokeDashoffset="10" />
        </svg>
        <p className="loading-text mt-4 text-lg text-muted-foreground">
          {loadingMessages[currentMessageIndex]}
        </p>
    </div>
  );
}

    
