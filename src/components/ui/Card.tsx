import { cn } from '@/lib/utils';

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("bg-zinc-950/40 border border-zinc-800/80 rounded-none overflow-hidden backdrop-blur-sm", className)}>
      {children}
    </div>
  );
}

export function CardHeader({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("px-6 py-5 border-b border-zinc-800/80 shrink-0", className)}>{children}</div>;
}

export function CardTitle({ className, children }: { className?: string; children: React.ReactNode }) {
  return <h3 className={cn("text-sm font-mono tracking-widest text-zinc-100 uppercase", className)}>{children}</h3>;
}

export function CardDescription({ className, children }: { className?: string; children: React.ReactNode }) {
  return <p className={cn("text-xs font-mono text-zinc-500 mt-2 leading-relaxed tracking-wide list-inside", className)}>{children}</p>;
}

export function CardContent({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("p-6", className)}>{children}</div>;
}
