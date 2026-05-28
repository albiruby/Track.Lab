import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-6 text-center">
      <h1 className="text-6xl font-display font-black tracking-tight text-foreground uppercase">
        404 NOT FOUND
      </h1>
      <p className="text-muted-foreground max-w-md font-bold tracking-widest uppercase">
        The requested calculator lab does not exist.
      </p>
      <div className="flex gap-4">
        <Link 
          href="/" 
          className="px-6 py-3 border-2 border-border-heavy bg-primary text-primary-foreground font-bold uppercase tracking-widest shadow-[4px_4px_0px_rgba(23,23,23,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_rgba(23,23,23,1)] transition-all"
        >
          RETURN TO HUB
        </Link>
        <Link 
          href="/formulas" 
          className="px-6 py-3 border-2 border-border-heavy bg-card text-foreground font-bold uppercase tracking-widest shadow-[4px_4px_0px_rgba(23,23,23,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_rgba(23,23,23,1)] transition-all"
        >
          VIEW LIBRARY
        </Link>
      </div>
    </div>
  );
}
