import { Card, CardContent, CardTitle, CardDescription } from '@/components/ui/Card';
import { LAB_ROUTES } from '@/data/navigation';
import Link from 'next/link';
import { ShieldCheck, Database, BotOff, FunctionSquare, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const DESCRIPTIONS: Record<string, string> = {
  '/pace': 'Calculate pace, time, speed, and splits.',
  '/split': 'Build race, lap, and interval split tables.',
  '/heart-rate': 'Compare HRmax methods and calculate training zones transparently.',
  '/zone': 'Build HR, pace, power, and RPE zones.',
  '/rpe': 'Convert perceived effort into rule-based load metrics.',
  '/race': 'Estimate race outcomes and target splits.',
  '/training-pace': 'Convert current fitness into pace ranges.',
  '/critical-speed': 'Estimate CS, D′, and related pacing.',
  '/vo2': 'Estimate VO2, METs, and energy cost.',
  '/workout': 'Calculate interval structure and session totals.',
  '/workout-library': 'Browse static workout templates.',
  '/test': 'Calculate field-test outputs and confidence labels.',
  '/load': 'Calculate volume, load, and intensity ratios.',
  '/fuel': 'Plan carbs, fluid, sodium, and sweat rate.',
  '/environment': 'Estimate condition effects and cautions.',
  '/trail-elevation': 'Calculate grade, vertical speed, and climb metrics.',
  '/treadmill': 'Convert pace, speed, incline, and metabolic cost.',
  '/track': 'Build track splits and interval sets.',
  '/biomechanics': 'Calculate cadence, stride, and step metrics.',
  '/power': 'Analyze user-provided running power.',
  '/recovery': 'Calculate recovery deltas from manual inputs.',
  '/gear': 'Estimate shoe mileage and gear cost.',
  '/race-day': 'Build manual race timeline and fueling checkpoints.',
  '/conversion': 'Convert running and sport-science units.',
  '/calendar': 'Preview manual weekly structure and ratios.',
  '/formulas': 'Browse formulas, limitations, and confidence labels.',
};

export default function Home() {
  return (
    <div className="space-y-12 pb-16">
      <div className="brutalist-panel-heavy bg-card p-8 md:p-12 relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary rounded-full opacity-20 blur-3xl pointer-events-none"></div>
        <div className="relative z-10 space-y-6 max-w-4xl pt-4">
          <div className="flex gap-2">
             <div className="h-6 w-3 bg-primary rounded-full" />
             <div className="text-xs font-bold uppercase tracking-widest text-primary">System Online</div>
          </div>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-display font-black uppercase tracking-tighter text-foreground leading-[0.9]">
            Running Architecture
          </h1>
          <p className="text-muted-foreground font-medium text-lg md:text-xl leading-relaxed max-w-2xl border-l-4 border-primary pl-4">
            A deterministic, formula-based calculator suite for clear, transparent, and practical training analysis.
          </p>
          <div className="flex flex-wrap gap-4 pt-4">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground bg-white px-4 py-2 rounded-full border-2 border-border-heavy shadow-[2px_2px_0px_rgba(23,23,23,1)]">
              <FunctionSquare className="w-4 h-4 text-primary" />
              Transparent
            </div>
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground bg-white px-4 py-2 rounded-full border-2 border-border-heavy shadow-[2px_2px_0px_rgba(23,23,23,1)]">
              <ShieldCheck className="w-4 h-4 text-primary" />
              Manual Input
            </div>
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground bg-white px-4 py-2 rounded-full border-2 border-border-heavy shadow-[2px_2px_0px_rgba(23,23,23,1)]">
              <BotOff className="w-4 h-4 text-primary" />
              No AI
            </div>
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground bg-white px-4 py-2 rounded-full border-2 border-border-heavy shadow-[2px_2px_0px_rgba(23,23,23,1)]">
              <Database className="w-4 h-4 text-primary" />
              No Stored Data
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-display font-bold uppercase tracking-tighter flex items-center gap-3">
          <span className="w-6 h-6 rounded-full bg-foreground flex items-center justify-center border-2 border-foreground">
            <span className="w-2 h-2 rounded-full bg-background" />
          </span>
          Active Modules
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {LAB_ROUTES.filter(r => r.href !== '/').map((route, i) => {
            const Icon = route.icon;
            const desc = DESCRIPTIONS[route.href] || 'Calculate values and metrics for this module.';
            const tagText = route.href === '/formulas' ? 'Reference' : (route.href === '/workout-library' ? 'Library' : 'Calculator');
            const isFeatured = i % 5 === 0;
            
            return (
              <Link key={route.href} href={route.href} className="group outline-none block h-full">
                <div className={cn(
                  "h-full transition-all duration-200 brutalist-panel-heavy p-6 flex flex-col group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:shadow-[0px_0px_0px_rgba(23,23,23,1)]",
                  isFeatured ? "bg-card relative overflow-hidden" : "bg-white"
                )}>
                  {isFeatured && (
                    <div className="absolute -right-12 -top-12 w-32 h-32 bg-primary/20 rounded-full blur-2xl group-hover:bg-primary/40 transition-colors" />
                  )}
                  
                  <div className="flex items-center justify-between w-full mb-6 relative z-10">
                    <div className={cn(
                      "p-3 rounded-xl border-2 border-border-heavy shadow-[2px_2px_0px_rgba(23,23,23,1)] group-hover:shadow-none group-hover:translate-x-[2px] group-hover:translate-y-[2px] transition-all",
                      isFeatured ? "bg-primary text-primary-foreground" : "bg-card text-foreground"
                    )}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex gap-2">
                      <span className="text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full border-2 border-border-heavy bg-card text-muted-foreground shadow-[1px_1px_0px_rgba(23,23,23,1)]">
                        {tagText}
                      </span>
                      <div className="w-8 h-8 rounded-full border-2 border-border-heavy flex items-center justify-center bg-card shadow-[1px_1px_0px_rgba(23,23,23,1)] text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors group-hover:shadow-none group-hover:translate-y-[1px] group-hover:translate-x-[1px]">
                         <ArrowUpRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3 mt-auto relative z-10">
                    <h3 className="text-xl font-display font-bold uppercase tracking-tight text-foreground group-hover:text-primary transition-colors">
                      {route.name}
                    </h3>
                    <p className="text-sm font-medium text-muted-foreground line-clamp-2">
                      {desc}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
