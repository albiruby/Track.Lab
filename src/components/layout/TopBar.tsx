import Link from 'next/link';
import { BookOpen } from 'lucide-react';

export function TopBar() {
  return (
    <header className="h-[64px] border-b-2 border-border-heavy bg-card sticky top-0 z-20 flex items-center justify-between px-6 select-none shrink-0">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          {/* We rely on Sidebar for brand on desktop, but show something simple here maybe, or nothing if we want it super clean. Let's show route context or breadcrumb-like element on client side, but server side just simple text */}
          <span className="font-display font-bold uppercase tracking-tight text-card-foreground md:hidden">Track.Lab</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Link href="/formulas" className="flex h-9 px-4 rounded-lg border-2 border-border-heavy bg-card hover:bg-neutral-100 text-card-foreground items-center justify-center text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer gap-2">
          <BookOpen className="w-4 h-4" />
          <span className="hidden sm:inline">Formulas</span>
        </Link>
      </div>
    </header>
  );
}
