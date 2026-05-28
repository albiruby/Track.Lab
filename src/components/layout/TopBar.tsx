import Link from 'next/link';
import { BookOpen } from 'lucide-react';

export function TopBar() {
  return (
    <header className="h-[60px] border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between px-6 select-none shrink-0">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="font-semibold tracking-tight text-foreground">Track.Lab</span>
        </div>
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <Link href="/formulas" className="hover:text-foreground transition-colors">Formula Library</Link>
        </nav>
      </div>

      <div className="flex items-center gap-4">
        <Link href="/formulas" className="hidden sm:flex h-9 px-4 rounded-md border border-input bg-background hover:bg-muted text-foreground items-center justify-center text-sm font-medium transition-colors cursor-pointer gap-2">
          <BookOpen className="w-4 h-4 text-muted-foreground" />
          Formulas
        </Link>
      </div>
    </header>
  );
}
