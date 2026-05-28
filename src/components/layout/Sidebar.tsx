'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, FunctionSquare } from 'lucide-react';
import { useState } from 'react';
import { LAB_ROUTES } from '@/data/navigation';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="md:hidden flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        <div className="flex items-center gap-2 font-bold text-lg">
          <FunctionSquare className="w-6 h-6 text-zinc-900 dark:text-zinc-50" />
          Track.Lab
        </div>
        <button onClick={() => setIsOpen(!isOpen)} className="p-2">
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 transform transition-transform duration-200 ease-in-out md:translate-x-0 md:static md:h-screen md:flex md:flex-col overflow-y-auto",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 hidden md:flex items-center gap-2 font-bold text-xl tracking-tight">
          <FunctionSquare className="w-6 h-6 text-zinc-900 dark:text-zinc-50" />
          Track.Lab
        </div>
        <nav className="flex-1 px-4 pb-6 space-y-1">
          {LAB_ROUTES.map((route) => {
            const isActive = pathname === route.href;
            const Icon = route.icon;
            return (
              <Link
                key={route.href}
                href={route.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  isActive 
                    ? "bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50" 
                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:text-zinc-50"
                )}
              >
                <Icon className="w-4 h-4" />
                {route.name}
              </Link>
            );
          })}
        </nav>
      </div>
      
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 md:hidden" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
