import React from 'react';
import { cn } from '@/lib/utils';

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        "flex h-10 w-full rounded-lg border border-[#d8ddd8] bg-white px-3.5 py-1.5 text-xs md:text-sm font-normal placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-[#0f6fae] focus:border-[#0f6fae] disabled:cursor-not-allowed disabled:opacity-50 transition-all text-foreground shadow-sm",
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
      className={cn("text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1 block select-none", className)}
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
        "flex h-10 w-full items-center justify-between rounded-lg border border-[#d8ddd8] bg-white px-3.5 py-1.5 text-xs md:text-sm font-normal placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-[#0f6fae] focus:border-[#0f6fae] disabled:cursor-not-allowed disabled:opacity-50 text-foreground shadow-sm",
        className
      )}
      {...props}
    />
  );
});
Select.displayName = 'Select';

export const ValidationMessage = ({ message }: { message?: string | null }) => {
  if (!message) return null;
  return (
    <div className="text-[10px] text-[#b91c1c] mt-1.5 font-medium tracking-normal bg-red-50/80 px-3 py-1.5 rounded border border-red-200 select-none">
      * {message}
    </div>
  );
};

export const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' | 'outline' }>(({ className, variant = 'primary', ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center rounded-lg text-xs font-bold uppercase tracking-wider transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0f6fae] disabled:opacity-50 disabled:pointer-events-none h-10 py-1.5 px-4 cursor-pointer",
        variant === 'primary' && "bg-[#0b2f4a] text-white border border-[#0b2f4a] hover:bg-[#0f6fae] shadow-sm",
        variant === 'secondary' && "bg-[#e6f1f8] text-[#0b2f4a] border border-[#0b2f4a]/10 hover:bg-[#cbe3f3] shadow-xs",
        variant === 'ghost' && "bg-transparent text-muted-foreground hover:text-foreground hover:bg-[#f3f4f1]",
        variant === 'outline' && "border border-[#d8ddd8] bg-white hover:bg-[#f3f4f1] text-[#374151] shadow-xs",
        className
      )}
      {...props}
    />
  );
});
Button.displayName = 'Button';
