import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export function WarningNote({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex gap-3 items-start p-4 bg-yellow-50/50 text-[#b7791f] rounded-lg text-xs leading-relaxed border border-yellow-200/80", className)}>
      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
      <div>{children}</div>
    </div>
  );
}

export function InfoNote({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex gap-3 items-start p-4 bg-[#f3f4f1] text-[#374151] rounded-lg text-xs leading-relaxed border border-[#d8ddd8]", className)}>
      <div className="w-1.5 h-1.5 rounded-full bg-[#bfc8c0] shrink-0 mt-2" />
      <div>{children}</div>
    </div>
  );
}
