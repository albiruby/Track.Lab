import Link from 'next/link';
import { BookOpen } from 'lucide-react';

export function TopBar() {
  return (
    <header className="h-[64px] border-b border-[#d8ddd8] bg-white sticky top-0 z-20 flex items-center justify-between px-6 select-none shrink-0">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="font-sans font-bold uppercase tracking-tight text-[#0b2f4a] md:hidden">Track.Lab</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Link href="/formulas" className="flex h-9 px-4 rounded-lg border border-[#d8ddd8] bg-white hover:bg-[#f3f4f1] text-[#0b2f4a] items-center justify-center text-xs font-bold uppercase tracking-wider transition-all cursor-pointer gap-2 shadow-sm">
          <BookOpen className="w-4 h-4 text-[#0f6fae]" />
          <span className="hidden sm:inline">Formulas</span>
        </Link>
      </div>
    </header>
  );
}
