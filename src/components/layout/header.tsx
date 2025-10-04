
'use client';

import Link from 'next/link';
import { ThemeToggle } from './theme-toggle';
import { SearchBar } from '../search-bar';
import { DreamyDeskLogo } from './dreamy-desk-logo';

export function Header() {

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 px-4 py-4 backdrop-blur-sm sm:px-6">
      <div className="container mx-auto flex items-center justify-between gap-2">
        <Link href="/" className="flex flex-shrink-0 items-center gap-2">
          <DreamyDeskLogo />
          <span className="text-lg font-bold uppercase text-3d-professional">DreamyDesk</span>
        </Link>
        <div className="flex flex-1 items-center justify-end gap-2">
          <SearchBar />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
