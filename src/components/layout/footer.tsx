
import Link from 'next/link';
import { buttonVariants } from '../ui/button';
import { cn } from '@/lib/utils';

export function Footer() {
  return (
    <footer className="py-8 border-t">
      <div className="container mx-auto flex flex-col items-center justify-center text-center text-muted-foreground">
        <div className="flex items-center gap-4 mb-4">
            <Link href="/privacy" className={cn(buttonVariants({ variant: 'link', size: 'sm' }), 'text-muted-foreground')}>Privacy Policy</Link>
            <Link href="/terms" className={cn(buttonVariants({ variant: 'link', size: 'sm' }), 'text-muted-foreground')}>Terms of Use</Link>
            <Link href="/menu/contact" className={cn(buttonVariants({ variant: 'link', size: 'sm' }), 'text-muted-foreground')}>Contact</Link>
        </div>
        <p className="text-sm">&copy; {new Date().getFullYear()} DreamyDesk. All rights reserved.</p>
      </div>
    </footer>
  );
}
