'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Forms';
import { LAB_ROUTES } from '@/data/navigation';
import Link from 'next/link';
import { 
  ShieldCheck, Database, BotOff, FunctionSquare, ArrowUpRight, Search, Landmark 
} from 'lucide-react';
import { cn } from '@/lib/utils';

const CATEGORIES = [
  'All',
  'Pace & Race',
  'Intensity',
  'Workout & Load',
  'Fuel & Environment',
  'Mechanics & Gear',
  'Practical Tools',
  'Reference'
];

export default function QuickLabHomepage() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredRoutes = useMemo(() => {
    // We only display the 26 actual calculator page modules on the homepage launcher, excluding Home itself ('/')
    return LAB_ROUTES.filter(route => route.href !== '/').filter(route => {
      const matchesSearch = 
        route.name.toLowerCase().includes(search.toLowerCase()) ||
        route.description.toLowerCase().includes(search.toLowerCase()) ||
        route.shortSummary?.toLowerCase().includes(search.toLowerCase()) ||
        route.tags?.some(t => t.toLowerCase().includes(search.toLowerCase()));

      const matchesCategory = activeCategory === 'All' || route.category === activeCategory;

      return matchesSearch && matchesCategory;
    });
  }, [search, activeCategory]);

  return (
    <div className="space-y-10 pb-16">
      {/* 1. Jumbotron Header with Permanent Positioning */}
      <div className="brutalist-panel-heavy bg-card p-6 md:p-10 relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary rounded-full opacity-10 blur-3xl pointer-events-none"></div>
        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-primary">Deterministic Core Online</span>
          </div>
          
          <h1 className="text-4xl sm:text-6xl font-display font-black uppercase tracking-tighter text-foreground leading-[0.95]">
            Quick Lab Launcher
          </h1>
          
          {/* TRACK.LAB PERMANENT POSITIONING PARAGRAPH */}
          <p className="text-xs sm:text-sm text-neutral-600 font-medium leading-relaxed max-w-4xl border-l-4 border-primary pl-4 bg-white/50 p-3 rounded shadow-[1px_1px_0px_rgba(23,23,23,0.05)]">
            Track.Lab is a formula-based running calculator suite that helps runners calculate training and racing needs transparently, practically, and deterministically through manual input. Track.Lab is not an AI coach, not an automatic coaching app, not a training database, and not a gimmick dashboard; every result comes from clear formulas, traceable methods, and data entered directly by the user. Track.Lab exists as a lightweight sport-science calculation tool with permanent principles: manual input only, formula shown, no AI, no database, no stored data, no fake metrics, and no gimmick.
          </p>

          {/* 6. TECHNICAL CHARACTERISTICS CHIPS */}
          <div className="flex flex-wrap gap-2.5 pt-2">
            <span className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-foreground bg-white px-3.5 py-1.5 rounded-lg border-2 border-border-heavy shadow-[1.5px_1.5px_0px_rgba(23,23,23,1)]">
              <FunctionSquare className="w-3.5 h-3.5 text-primary" />
              100% Formula-Based
            </span>
            <span className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-foreground bg-white px-3.5 py-1.5 rounded-lg border-2 border-border-heavy shadow-[1.5px_1.5px_0px_rgba(23,23,23,1)]">
              <ShieldCheck className="w-3.5 h-3.5 text-primary" />
              Manual Input Only
            </span>
            <span className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-foreground bg-white px-3.5 py-1.5 rounded-lg border-2 border-border-heavy shadow-[1.5px_1.5px_0px_rgba(23,23,23,1)]">
              <BotOff className="w-3.5 h-3.5 text-primary" />
              Zero AI Hallucinations
            </span>
            <span className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-foreground bg-white px-3.5 py-1.5 rounded-lg border-2 border-border-heavy shadow-[1.5px_1.5px_0px_rgba(23,23,23,1)]">
              <Database className="w-3.5 h-3.5 text-primary" />
              Zero Persistent Storage
            </span>
          </div>
        </div>
      </div>

      {/* 5. NO STORAGE POLICY WARNING CARD */}
      <div className="bg-amber-50/50 border-2 border-amber-300 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-amber-600" />
            No Storage Policy Enforced
          </h4>
          <p className="text-[11px] text-amber-700 font-semibold">
            All calculation metrics entered are held purely in local state memory. No cookies, no trackers, no backend storage, and no cloud synchronization. Your data never leaves this page session. Export your metrics manually before closing.
          </p>
        </div>
        <div className="shrink-0">
          <Link href="/formulas" className="px-3 py-1.5 border-2 border-amber-400 bg-white hover:bg-amber-50 text-[10px] font-bold uppercase tracking-widest text-amber-800 rounded shadow-[1.5px_1.5px_0px_rgba(180,83,9,1)] transition-colors inline-block text-center">
            View Method Catalog
          </Link>
        </div>
      </div>

      {/* 3 & 4. FILTER CONTROLS & MODULE SEARCH */}
      <div className="space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <h2 className="text-xl font-display font-black uppercase tracking-tight flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-foreground border-2 border-foreground flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-background" />
            </span>
            Select Lab Module
          </h2>

          <div className="relative w-full lg:max-w-md">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
            <Input 
              type="text" 
              placeholder="Search by name, tags, description..." 
              value={search} 
              onChange={e => setSearch(e.target.value)}
              className="pl-9 bg-white"
            />
          </div>
        </div>

        {/* 4. category grouping tabs */}
        <div className="flex flex-wrap gap-1.5 border-b-2 border-border-heavy pb-3">
          {CATEGORIES.map(cat => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded border-2 transition-all cursor-pointer",
                  isActive
                    ? "bg-primary text-primary-foreground border-border-heavy shadow-[1.5px_1.5px_0px_rgba(23,23,23,1)]"
                    : "bg-white text-muted-foreground border-transparent hover:bg-neutral-50 hover:text-foreground"
                )}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. 27-MODULE LAUNCHER GRID (Filtering dynamically) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRoutes.map((route, idx) => {
          const Icon = route.icon;
          const isFeatured = idx % 4 === 0;

          return (
            <Link 
              id={`module-btn-${route.id}`}
              key={route.href} 
              href={route.href} 
              className="group outline-none block h-full select-none cursor-pointer"
            >
              <div className={cn(
                "h-full transition-all duration-150 brutalist-panel-heavy p-5 flex flex-col justify-between group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:shadow-[0px_0px_0px_rgba(23,23,23,1)]",
                isFeatured ? "bg-card relative overflow-hidden" : "bg-white"
              )}>
                {isFeatured && (
                  <div className="absolute -right-12 -top-12 w-32 h-32 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/25 transition-colors pointer-events-none" />
                )}

                <div className="relative z-10">
                  {/* Card Header row */}
                  <div className="flex items-center justify-between w-full mb-4">
                    <div className={cn(
                      "p-2.5 rounded-xl border-2 border-border-heavy shadow-[1.5px_1.5px_0px_rgba(23,23,23,1)] group-hover:translate-y-[1px] group-hover:translate-x-[1px] group-hover:shadow-none transition-all",
                      isFeatured ? "bg-primary text-primary-foreground" : "bg-card text-foreground"
                    )}>
                      <Icon className="w-5 h-5 shrink-0" />
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[8px] font-black tracking-widest uppercase px-2.5 py-1 rounded bg-card text-muted-foreground border border-border">
                        {route.category}
                      </span>
                      <div className="w-7 h-7 rounded-full border border-border flex items-center justify-center bg-card text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors group-hover:border-primary">
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>

                  {/* Module Details */}
                  <div className="space-y-2 mt-2">
                    <h3 className="text-lg font-display font-black uppercase tracking-tight text-foreground group-hover:text-primary transition-colors">
                      {route.name}
                    </h3>
                    <p className="text-[11px] font-semibold text-muted-foreground line-clamp-2 leading-relaxed">
                      {route.description}
                    </p>
                  </div>
                </div>

                {/* Card footer: Subtext and tags */}
                <div className="relative z-10 border-t border-dashed border-border mt-4 pt-3 flex flex-wrap items-center justify-between gap-2 shrink-0">
                  <span className="text-[9px] font-mono uppercase tracking-widest text-neutral-400">
                    {route.shortSummary}
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {(route.tags || []).slice(0, 2).map(tag => (
                      <span key={tag} className="text-[8px] font-black uppercase tracking-wider text-neutral-500 bg-neutral-100 px-1.5 py-0.5 rounded border border-neutral-200">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}

        {filteredRoutes.length === 0 && (
          <div className="col-span-full py-16 text-center text-muted-foreground border-2 border-dashed border-border-heavy bg-card rounded-xl font-bold tracking-widest uppercase shadow-[inset_2px_2px_0px_rgba(0,0,0,0.05)]">
            NO COMPLIANT RUNNING MODULES MATCHED SEARCH PRESET
          </div>
        )}
      </div>
    </div>
  );
}
