import Link from 'next/link';

export function TopBar() {
  return (
    <header className="h-[60px] border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-20 flex items-center justify-between px-6 select-none shrink-0">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
          <span className="font-mono text-xs font-bold tracking-widest text-cyan-400 uppercase">TRACK.LAB</span>
        </div>
        <nav className="hidden md:flex items-center gap-4 text-xs font-mono uppercase tracking-widest text-zinc-500">
          <Link href="/" className="hover:text-zinc-300 transition-colors">Dashboard</Link>
          <Link href="/formulas" className="hover:text-zinc-300 transition-colors">Formula Library</Link>
          <span className="text-zinc-700">System Status</span>
        </nav>
      </div>

      <div className="flex items-center gap-4">
        <Link href="/formulas" className="hidden sm:flex h-8 px-4 border border-cyan-500/50 bg-cyan-500/10 text-cyan-400 items-center justify-center font-mono text-[10px] uppercase font-bold tracking-widest hover:bg-cyan-500/20 transition-colors cursor-pointer">
          FORMULAS
        </Link>
      </div>
    </header>
  );
}
