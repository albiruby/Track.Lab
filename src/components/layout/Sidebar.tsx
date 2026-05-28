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
      <div className="md:hidden flex items-center justify-between p-4 border-b border-border/50 bg-background text-foreground">
        <div className="flex items-center gap-2 font-bold tracking-tight text-lg">
          Track.Lab
        </div>
        <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-muted-foreground hover:text-foreground">
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border/50 transform transition-transform duration-200 ease-in-out md:translate-x-0 md:static md:h-screen md:flex md:flex-col overflow-hidden shrink-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 md:flex flex-col gap-1 hidden shrink-0">
          <div className="font-bold text-2xl tracking-tight text-foreground">
            Track.Lab
          </div>
          <div className="text-xs text-muted-foreground">
            Running Calculator Suite
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 pb-6 tracklab-scrollbar space-y-0.5">
          {LAB_ROUTES.map((route) => {
            const isActive = pathname === route.href;
            const Icon = route.icon;
            return (
              <Link
                key={route.href}
                href={route.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors group relative",
                  isActive 
                    ? "text-primary bg-primary/10" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {isActive && (
                  <div className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-full bg-primary" />
                )}
                <Icon className={cn("w-4 h-4 shrink-0 transition-colors", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                <span className="truncate">{route.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
      
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-background/80 md:hidden backdrop-blur-sm" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}

