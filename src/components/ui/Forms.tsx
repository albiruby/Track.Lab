import React from 'react';
import { cn } from '@/lib/utils';

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        "flex h-10 w-full rounded-none border border-zinc-800 bg-zinc-950/50 px-3 py-2 text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 disabled:cursor-not-allowed disabled:opacity-50 transition-colors font-mono text-zinc-100",
        className
      )}
      {...props}
    />
  );
});
Input.displayName = 'Input';

export const Label = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(({ className, ...props }, ref) => {
  return (
    <label
      ref={ref}
      className={cn("text-xs font-mono font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-zinc-400 mb-2 block tracking-widest uppercase", className)}
      {...props}
    />
  );
});
Label.displayName = 'Label';

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(({ className, ...props }, ref) => {
  return (
    <select
      ref={ref}
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-none border border-zinc-800 bg-zinc-950/50 px-3 py-2 text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 disabled:cursor-not-allowed disabled:opacity-50 font-mono text-zinc-100 uppercase tracking-wider",
        className
      )}
      {...props}
    />
  );
});
Select.displayName = 'Select';

export const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' }>(({ className, variant = 'primary', ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center rounded-none text-xs font-mono tracking-widest uppercase font-bold transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-500 disabled:opacity-50 disabled:pointer-events-none h-10 py-2 px-6",
        variant === 'primary' && "bg-cyan-500/10 text-cyan-400 border border-cyan-500/50 hover:bg-cyan-500/20 shadow-[0_0_15px_rgba(34,211,238,0.1)]",
        variant === 'secondary' && "bg-zinc-900 border border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100",
        variant === 'ghost' && "bg-transparent text-zinc-400 hover:text-cyan-400 hover:bg-cyan-950/30",
        className
      )}
      {...props}
    />
  );
});
Button.displayName = 'Button';
