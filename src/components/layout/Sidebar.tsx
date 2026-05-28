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
      <div className="md:hidden flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-950 text-zinc-100">
        <div className="flex items-center gap-2 font-bold font-mono tracking-tight text-lg">
          Track.Lab
        </div>
        <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-zinc-400 hover:text-zinc-100">
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-zinc-950 border-r border-zinc-800 transform transition-transform duration-200 ease-in-out md:translate-x-0 md:static md:h-screen md:flex md:flex-col overflow-hidden shrink-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 md:flex flex-col gap-1 hidden shrink-0">
          <div className="font-bold text-2xl tracking-tight text-zinc-50">
            Track.Lab
          </div>
          <div className="text-[10px] uppercase font-mono tracking-widest text-zinc-500">
            Elite Performance OS
          </div>
        </div>

        <div className="px-5 mb-6 shrink-0 hidden md:block">
          <Link href="/" onClick={() => setIsOpen(false)} className="w-full flex items-center justify-center py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-bold font-mono text-xs uppercase tracking-widest transition-colors mb-2 rounded-sm border border-transparent">
            + NEW SESSION
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto px-0 pb-6 tracklab-scrollbar">
          {LAB_ROUTES.map((route) => {
            const isActive = pathname === route.href;
            const Icon = route.icon;
            return (
              <Link
                key={route.href}
                href={route.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-6 py-3 text-xs font-mono uppercase tracking-wider transition-colors relative group",
                  isActive 
                    ? "text-cyan-400 bg-cyan-950/20" 
                    : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100"
                )}
              >
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                )}
                <Icon className={cn("w-4 h-4", isActive ? "text-cyan-400" : "text-zinc-500 group-hover:text-zinc-100")} />
                {route.name}
              </Link>
            );
          })}
        </nav>
      </div>
      
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/80 md:hidden backdrop-blur-sm" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}

