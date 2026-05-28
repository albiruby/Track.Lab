import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export function WarningNote({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex gap-3 items-start p-4 bg-amber-50 dark:bg-amber-500/10 text-amber-900 dark:text-amber-400 rounded-lg text-sm", className)}>
      <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
      <div>{children}</div>
    </div>
  );
}

export function InfoNote({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex gap-3 items-start p-4 bg-zinc-100 dark:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300 rounded-lg text-sm", className)}>
      <div className="w-1.5 h-1.5 rounded-full bg-zinc-400 shrink-0 mt-2" />
      <div>{children}</div>
    </div>
  );
}
