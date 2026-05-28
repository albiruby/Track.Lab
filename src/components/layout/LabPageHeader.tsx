export function LabPageHeader({ title, subtitle }: { title: string, subtitle: string }) {
  return (
    <div className="mb-8 space-y-3">
      <div className="flex items-center gap-3 text-cyan-400">
        <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
        <h1 className="text-xl md:text-2xl font-mono font-bold tracking-widest uppercase">
          {title}
        </h1>
      </div>
      <p className="text-zinc-500 font-mono text-sm max-w-2xl">
        {subtitle}
      </p>
    </div>
  );
}
