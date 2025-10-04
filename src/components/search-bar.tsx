
"use client";

import { Search } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { logSearchQuery } from '@/services/analytics-service';

export function SearchBar() {
  const [isFocused, setIsFocused] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const searchBoxRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setIsFocused(false);
    if(inputRef.current) {
        inputRef.current.blur();
        inputRef.current.value = "";
    }
    setQuery("");
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleFocus = () => {
    setIsFocused(true);
  }
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedQuery = query.trim();
    if (trimmedQuery) {
      logSearchQuery(trimmedQuery);
      router.push(`/search?q=${encodeURIComponent(trimmedQuery)}`);
    } else if (!isFocused) {
      // If not focused and query is empty, focus the input
      setIsFocused(true);
      inputRef.current?.focus();
    }
  }

  return (
    <form 
      onSubmit={handleSearch}
      ref={searchBoxRef}
      className={`searchBox group ${isFocused ? 'focused' : ''}`}
    >
      <input 
        ref={inputRef}
        className="searchInput" 
        type="text" 
        name="search" 
        placeholder="Search..."
        onFocus={handleFocus}
        onChange={(e) => setQuery(e.target.value)}
        value={query}
      />
      <button className="searchButton" type="submit" aria-label="Search">
        <Search size={20} />
      </button>
    </form>
  );
}
