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
      <div className="md:hidden flex items-center justify-between p-4 border-b border-[#d8ddd8] bg-card text-[#111827]">
        <div className="flex items-center gap-2 font-sans font-bold tracking-tight text-lg text-[#0b2f4a]">
          TRACK.LAB
        </div>
        <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-muted-foreground hover:text-foreground">
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-[#f3f4f1] border-r border-[#d8ddd8] transform transition-transform duration-200 ease-in-out md:translate-x-0 md:static md:h-screen md:flex md:flex-col overflow-hidden shrink-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-5 md:flex flex-col gap-1 hidden shrink-0 border-b border-[#d8ddd8]">
          <Link href="/" className="font-sans font-bold text-xl tracking-tight text-[#0b2f4a] flex items-center gap-1.5 hover:text-[#0f6fae] transition-colors">
            Track.Lab
          </Link>
          <div className="text-[10px] font-mono tracking-wider text-muted-foreground">
            Research Console v2.4.0
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
                  "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all group relative border",
                  isActive 
                    ? "bg-[#e6f1f8] text-[#0f6fae] border-[#0f6fae]/20 font-semibold" 
                    : "border-transparent text-[#374151] hover:bg-[#e9ece8] hover:text-[#111827]"
                )}
              >
                <Icon className={cn("w-4 h-4 shrink-0 transition-colors", isActive ? "text-[#0f6fae]" : "text-muted-foreground group-hover:text-foreground")} />
                <span className="truncate uppercase tracking-wide text-xs">{route.name}</span>
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-[#d8ddd8] shrink-0">
           <Link href="/" className="flex items-center justify-center w-full px-4 py-2 bg-[#0b2f4a] hover:bg-[#0f6fae] text-white text-xs font-bold uppercase tracking-wider rounded transition-colors shadow-sm">
             Reset Workspace
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

