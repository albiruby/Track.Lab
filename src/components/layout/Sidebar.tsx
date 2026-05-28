'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { LAB_ROUTES } from '@/data/navigation';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="md:hidden flex items-center justify-between p-4 border-b border-border-heavy bg-card text-card-foreground">
        <div className="flex items-center gap-2 font-display font-bold tracking-tight text-xl uppercase">
          Track.Lab
        </div>
        <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-muted-foreground hover:text-foreground">
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r-2 border-border-heavy transform transition-transform duration-200 ease-in-out md:translate-x-0 md:static md:h-screen md:flex md:flex-col overflow-hidden shrink-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-5 md:flex flex-col gap-1 hidden shrink-0 border-b-2 border-border-heavy">
          <Link href="/" className="font-display font-bold text-2xl tracking-tighter uppercase text-card-foreground group hover:text-primary transition-colors">
            Track<span className="text-primary group-hover:text-card-foreground transition-colors">.</span>Lab
          </Link>
          <div className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground mt-1">
            v2.4.0-Stable
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 tracklab-scrollbar space-y-1">
          {LAB_ROUTES.map((route) => {
            const isActive = pathname === route.href;
            const Icon = route.icon;
            return (
              <Link
                key={route.href}
                href={route.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 text-sm font-semibold rounded-lg transition-all group relative border-2",
                  isActive 
                    ? "bg-primary text-primary-foreground border-border-heavy shadow-[2px_2px_0px_rgba(23,23,23,1)]" 
                    : "border-transparent text-muted-foreground hover:bg-muted hover:text-card-foreground"
                )}
              >
                <Icon className={cn("w-4 h-4 shrink-0 transition-colors", isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-card-foreground")} />
                <span className="truncate uppercase tracking-wide text-xs">{route.name}</span>
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t-2 border-border-heavy shrink-0">
           <Link href="/" className="flex items-center justify-center w-full px-4 py-3 brutalist-panel-dark text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition-colors">
             New Session
           </Link>
        </div>
      </div>
      
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-foreground/20 md:hidden backdrop-blur-sm" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}

