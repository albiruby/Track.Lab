import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-6 text-center font-mono uppercase tracking-widest">
      <h1 className="text-4xl font-bold tracking-tight text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">
        ERR_404 // MODULE NOT FOUND
      </h1>
      <p className="text-zinc-500 max-w-md text-xs leading-relaxed">
        [ The requested calculator lab does not exist in the current index. Re-route required. ]
      </p>
      <div className="flex gap-4">
        <Link 
          href="/" 
          className="px-6 py-2 border border-cyan-500/50 bg-cyan-950/20 text-cyan-400 text-[10px] uppercase font-bold tracking-widest hover:bg-cyan-900/30 hover:border-cyan-400 transition-colors shadow-[0_0_10px_rgba(34,211,238,0.1)]"
        >
          INIT RETURN TO SOURCE
        </Link>
        <Link 
          href="/formulas" 
          className="px-6 py-2 border border-zinc-800 bg-zinc-950 text-zinc-400 text-[10px] uppercase font-bold tracking-widest hover:border-zinc-600 hover:text-zinc-300 transition-colors"
        >
          VIEW SYSTEM REGISTRY
        </Link>
      </div>
    </div>
  );
}
