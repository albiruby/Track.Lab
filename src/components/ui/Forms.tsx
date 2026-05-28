import React from 'react';
import { cn } from '@/lib/utils';

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        "flex h-12 w-full rounded-xl border-2 border-border-heavy bg-white px-4 py-2 text-sm font-medium placeholder:text-muted-foreground focus:outline-none focus:ring-0 focus:border-primary disabled:cursor-not-allowed disabled:opacity-50 transition-colors text-foreground shadow-[2px_2px_0px_rgba(23,23,23,0.1)] focus:shadow-[2px_2px_0px_rgba(242,195,0,1)]",
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
      className={cn("text-xs font-bold uppercase tracking-wider peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-foreground mb-2 block", className)}
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
        "flex h-12 w-full items-center justify-between rounded-xl border-2 border-border-heavy bg-white px-4 py-2 text-sm font-medium placeholder:text-muted-foreground focus:outline-none focus:ring-0 focus:border-primary disabled:cursor-not-allowed disabled:opacity-50 text-foreground shadow-[2px_2px_0px_rgba(23,23,23,0.1)] focus:shadow-[2px_2px_0px_rgba(242,195,0,1)]",
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
    <div className="text-xs text-destructive-foreground mt-2 font-bold tracking-wide uppercase bg-destructive px-3 py-2 rounded-lg border-2 border-border-heavy select-none shadow-[2px_2px_0px_rgba(23,23,23,1)]">
      {message}
    </div>
  );
};

export const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' | 'outline' }>(({ className, variant = 'primary', ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center rounded-xl text-sm font-bold uppercase tracking-wide transition-all focus-visible:outline-none focus-visible:ring-0 disabled:opacity-50 disabled:pointer-events-none h-12 py-2 px-6",
        variant === 'primary' && "bg-primary text-primary-foreground border-2 border-border-heavy shadow-[2px_2px_0px_rgba(23,23,23,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:translate-x-[2px] active:translate-y-[2px] active:shadow-none",
        variant === 'secondary' && "bg-secondary text-secondary-foreground border-2 border-border-heavy shadow-[2px_2px_0px_rgba(23,23,23,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none",
        variant === 'ghost' && "bg-transparent text-muted-foreground hover:text-foreground hover:bg-neutral-200",
        variant === 'outline' && "border-2 border-border-heavy bg-card hover:bg-neutral-100 text-foreground shadow-[2px_2px_0px_rgba(23,23,23,0.1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px]",
        className
      )}
      {...props}
    />
  );
});
Button.displayName = 'Button';
