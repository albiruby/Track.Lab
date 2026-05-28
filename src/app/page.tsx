import { Card, CardContent, CardTitle, CardDescription } from '@/components/ui/Card';
import { LAB_ROUTES } from '@/data/navigation';
import Link from 'next/link';
import { ShieldCheck, Database, BotOff, FunctionSquare } from 'lucide-react';

const DESCRIPTIONS: Record<string, string> = {
  '/pace': 'Calculate pace, time, speed, and splits from your direct inputs.',
  '/heart-rate': 'Compare HRmax methods and calculate training zones transparently.',
  '/zone': 'Build HR, HRR, LTHR, and pace zones using selected methods.',
  '/race': 'Estimate race outcomes and pacing using transparent formulas.',
  '/training-pace': 'Convert current fitness inputs into practical training pace ranges.',
  '/critical-speed': 'Estimate critical speed and related values from time trials.',
  '/vo2': 'Estimate VO2, METs, and metabolic cost from field inputs.',
  '/workout': 'Calculate interval structure, volume, rest, and total session time.',
  '/workout-library': 'Browse static workout templates and calculate target details.',
  '/load': 'Calculate weekly load, ratios, and rule-based volume checks.',
  '/fuel': 'Calculate carbs, fluids, sodium, and bottle planning.',
  '/environment': 'Estimate environmental adjustments with clear limitations.',
  '/trail-elevation': 'Calculate grade, vertical speed, and elevation metrics.',
  '/treadmill': 'Convert treadmill speed, pace, incline, and effort estimates.',
  '/biomechanics': 'Calculate cadence, stride length, step count, and related metrics.',
  '/power': 'Analyze user-provided running power, W/kg, and efficiency values.',
  '/recovery': 'Calculate manual recovery deltas without readiness scoring.',
  '/gear': 'Estimate shoe mileage, cost per kilometer, and fueling costs.',
  '/formulas': 'Browse all methods, formulas, limitations, and confidence labels.',
};

export default function Home() {
  return (
    <div className="space-y-12 pb-10">
      <div className="space-y-6 pt-4 md:pt-8 max-w-3xl">
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-foreground">
          Welcome to Track.Lab
        </h1>
        <p className="text-muted-foreground text-lg leading-relaxed">
          A formula-based running calculator suite for clear, transparent, and practical training calculations. Manual input only. No AI. No stored data.
        </p>
        <div className="flex flex-wrap gap-3 pt-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground bg-muted/40 px-3 py-1.5 rounded-full border border-border">
            <FunctionSquare className="w-3.5 h-3.5" />
            Formula shown
          </div>
          <div className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground bg-muted/40 px-3 py-1.5 rounded-full border border-border">
            <ShieldCheck className="w-3.5 h-3.5" />
            Manual input
          </div>
          <div className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground bg-muted/40 px-3 py-1.5 rounded-full border border-border">
            <BotOff className="w-3.5 h-3.5" />
            No AI
          </div>
          <div className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground bg-muted/40 px-3 py-1.5 rounded-full border border-border">
            <Database className="w-3.5 h-3.5" />
            No stored data
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {LAB_ROUTES.filter(r => r.href !== '/').map((route) => {
          const Icon = route.icon;
          const desc = DESCRIPTIONS[route.href] || 'Calculate values and metrics for this module.';
          const tagText = route.href === '/formulas' ? 'Reference' : (route.href === '/workout-library' ? 'Library' : 'Calculator');
          
          return (
            <Link key={route.href} href={route.href} className="group outline-none block h-full">
              <Card className="h-full transition-all duration-300 hover:shadow-md hover:border-primary/40 group-hover:-translate-y-1 bg-card">
                <CardContent className="p-6 flex flex-col items-start gap-4 h-full">
                  <div className="flex items-center justify-between w-full">
                    <div className="p-2.5 bg-primary/10 rounded-lg text-primary group-hover:scale-110 transition-transform duration-300">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-medium tracking-wide uppercase px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                      {tagText}
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    <CardTitle className="text-base group-hover:text-primary transition-colors">
                      {route.name}
                    </CardTitle>
                    <CardDescription className="text-sm mt-0 line-clamp-3">
                      {desc}
                    </CardDescription>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
